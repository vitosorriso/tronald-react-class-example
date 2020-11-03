import React from 'react';
import './App.css';

const logo = 'http://twitchy.com/wp-content/uploads/2015/11/donald-trump-funny-face-190x190.jpg'

const RANDOMURL = 'https://api.tronalddump.io/random/quote'
// const SEARCHURL = 'https://api.tronalddump.io/search/quote'
// const ALLTAGSURL = 'https://api.tronalddump.io/tag'

const TagList = (props) => (
  <p>
    {props.storedTags.map((tag, index) => 
      <span key={`tag-${index}`}>
        <a
          name={tag}
          onClick={props.onTagClick}
          className={props.selectedTag === tag ? "App-link-selected" : "App-link"}
          href="#"
        >
          {tag}
        </a>
        {index === props.storedTags.length - 1 ? '' : ' | ' }
      </span>
    )}
  </p>
)

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: false,
      currentQuote: {},
      quotesToShow: [],
      // getting storage string with key 'trumpQuotes' and parsing it (if exists)
      storedQuotes: ((JSON.parse(localStorage.getItem('trumpQuotes'))) !== null 
      ? (JSON.parse(localStorage.getItem('trumpQuotes'))) 
      : []),
      storedTags: ((JSON.parse(localStorage.getItem('trumpQuotesTags'))) !== null 
      ? (JSON.parse(localStorage.getItem('trumpQuotesTags'))) : []),
      selectedTag: '',
      isListMode: false
    }
  }

  fetchAndSaveRandomTrump = async () => {
    let quote = {}
    let error = false
    const storedQuotes = this.state.storedQuotes
    let storedTags = this.state.storedTags
    // see inside quote.tags.forEach
    // let storedTags = [...this.state.storedTags]
    let isNewQuote = true

    try {
      this.setState({ loading: true })
      let response = await fetch(RANDOMURL)
      let data = await response.json()
      // console.log('NEL TRY DATA: ', data)
      // promise is still resolved even if no quotes got fetched (example: wrong url)
      // need to handle this situation manually
      // throw new Error blocks the execution, and jumps directly into 'CATCH'
      if (data.error) throw new Error(data.error)

      quote = {...data}

      // checking stored quotes
      // avoid condition if array is empty
      if (storedQuotes.length > 0) {
        // check if quote already exists
        const indexQuote = storedQuotes.findIndex(storedQuote => quote.quote_id === storedQuote.quote_id)
        if (indexQuote > -1 ) { // this means that quote exist!
          isNewQuote = false
        }
      }

      // checking for each retrieved tag, if exists
      if (quote.tags.length > 0) {
        quote.tags.forEach(currentTag => {
          const indexTag = storedTags.findIndex(storedTag => storedTag === currentTag)
          if (indexTag === -1) {
            // mutable operation will lead to bugs here
            // storedTags.push(currentTag)
            storedTags = [...storedTags, currentTag]
          }
        })
      }
    } catch (err) {
      // console.log('SONO NEL CATCH: ', err)
      error = true
    } finally {
      // using setState with prevState
      // see https://css-tricks.com/understanding-react-setstate/
      this.setState((prevState) => {
        const quotesToSave = isNewQuote ? [...prevState.storedQuotes, quote] : prevState.storedQuotes
        // storing into localStorage
        localStorage.setItem('trumpQuotes', JSON.stringify(quotesToSave))
        localStorage.setItem('trumpQuotesTags', JSON.stringify(storedTags))
        return {
          ...this.state, // see immutables
          currentQuote: error ? {} : quote,
          loading: false,
          storedQuotes: [...quotesToSave],
          storedTags: [...storedTags]
        }
      })
    }
  }

  onTagClick = (event) => this.setState({ selectedTag: event.target.name })
  
  onModeClick = (event) => {
    console.log('id: ', event.target.id)
    this.setState({ isListMode: event.target.id === 'listbutton' ? true : false })
  } 

  componentDidUpdate(prevProps, prevState) {
    // console.log('PROBLEM!!! ', prevState.storedTags.length, this.state.storedTags.length)
    if (prevState.storedTags.length !== this.state.storedTags.length) console.log('DIFFERENZA STOREDTAG!')
  }

  render () {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className={`App-logo${this.state.loading ? " App-logo-spinning" : ""}`} alt="logo" />
          <p>
            <button id="randombutton" onClick={this.onModeClick} disabled={!this.state.isListMode}>
              <h2>RANDOM MODE</h2>
            </button>
            <button id="listbutton" onClick={this.onModeClick} disabled={this.state.isListMode}>
              <h2>LIST MODE</h2>
            </button>
          </p>
          {this.state.isListMode ? (<TagList
            storedTags={this.state.storedTags}
            onTagClick={this.onTagClick}
            selectedTag={this.state.selectedTag}
          />) : 
          (<><p>
            <button onClick={this.fetchAndSaveRandomTrump} disabled={this.state.loading}>
              <h2>{this.state.loading ? 'loading...' : 'RANDOM TRUMP QUOTE'}</h2>
            </button>
          </p>
          <p>{this.state.currentQuote.value}</p></>)}
          <p>Citazioni salvate: {this.state.storedQuotes.length}</p>
          <p>Tag salvati: {this.state.storedTags.length}</p>
        </header>
      </div>
    );
  }
}

export default App;


// mutable / immutable useful links:
// https://stackoverflow.com/questions/48057906/prevstate-in-componentdidupdate-is-the-currentstate#48058492
// https://ultimatecourses.com/blog/all-about-immutable-arrays-and-objects-in-javascript#immutable-object-operations