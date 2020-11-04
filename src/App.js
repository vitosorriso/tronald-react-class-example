import React from 'react';
import './App.css';

// TODO:
// FACILE
// 1) dividere i componenti in file diversi
// 2) this.state.currentQuote
//    creare un componente che visualizzi, oltre che la citazione stessa, anche:
//    - lista di tag associati alla citazione (array "tags")
//    - data della citazione (appeared_at)
//    - link alla fonte della citazione (investigare nella chiave "_embedded",
//      prendete sempre il primo elemento dell'array "source")
// 3) gestione carina ed appropriata degli errori (this.state.error)
// 4) modalità lista, visualizzare le citazioni associate al tag selezionato
//    (utilizzando il componente creato nel punto 2)
//    (fatelo comportare in maniera diversa a seconda della modalità random/list)
// 5) tornando alla modalità random, deselezionare il tag selezionato
// medio/difficile
// 6) arricchire il componente creato nel punto 2 con un meccanismo di salvataggio (solo in modalità random) - CONTROLLARE CHE LA CITAZIONE NON SIA STATA GIA' SALVATA (quote_id)
// 7) arricchire il componente creato nel punto 2 con un meccanismo di cancellazione (solo in modalità lista)
//    (utilizzate il campo "quote_id" all'interno della citazione)


const logo = require("./trump.gif")

const RANDOMURL = 'https://api.tronalddump.io/random/quote'
// const SEARCHURL = 'https://api.tronalddump.io/search/quote'
// const ALLTAGSURL = 'https://api.tronalddump.io/tag'

const TagList = (props) => {
  return (
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
)}

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

  // dividere in fetchRandomTrump() e saveRandomTrump()
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
        if (indexQuote > -1 ) { // this means that quote already exists!
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
          storedTags: [...storedTags],
          error
        }
      })
    }
  }

  onTagClick = (event) => this.setState({ selectedTag: event.target.name })
  
  onModeClick = (mode) => (event) => {
    // console.log('MODE? ', mode)
    this.setState({ isListMode: event.currentTarget.id === 'listbutton' ? true : false })
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
            <button class="button" id="randombutton" type="button" onClick={this.onModeClick('random')} disabled={!this.state.isListMode}>
              <h3> RANDOM MODE </h3> 
            </button>
            <button class="button" id="listbutton" type="button" onClick={this.onModeClick('list')} disabled={this.state.isListMode}>
              <h3> LIST MODE </h3>
            </button>
          </p>
          {this.state.isListMode ? (<TagList
            storedTags={this.state.storedTags}
            onTagClick={this.onTagClick}
            selectedTag={this.state.selectedTag}
          />) : (<>
            <p>
              <button onClick={this.fetchAndSaveRandomTrump} disabled={this.state.loading}>
                <h2>
                  {this.state.loading ? 'loading...' : 'RANDOM TRUMP QUOTE'}
                </h2>
              </button>
            </p>
            <p>{this.state.currentQuote.value}</p>
          </>)}
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

// OTHER USEFUL LINKS:
// https://www.taniarascia.com/understanding-destructuring-rest-spread/
// https://stackoverflow.com/questions/32782922/what-do-multiple-arrow-functions-mean-in-javascript