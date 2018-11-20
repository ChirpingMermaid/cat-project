import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      images: [],
      quotes: [],
      cats: [],
      catCards: [],
      favsOnly: false
    }
  }

  componentWillMount() {
    fetch('http://thecatapi.com/api/images/get?format=xml&results_per_page=25')
    .then(resp => resp.text())
    .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
    .then(data => {
      const imageNodes = data.firstChild.children[0].children[0];
      const images = [];
      
      for (let i = 0; i < imageNodes.children.length; i++) {
        let imageUrl = imageNodes.children[i].children[1].innerHTML;
        images.push(imageUrl);
      }
      this.setState({
        images: images
      });
    })
    .then(() => {
      fetch('https://catfact.ninja/facts?limit=25')
      .then(resp => resp.json())
      .then(data => {
        const quotes = [];
        for (let i = 0; i < data.data.length; i++) {
          let quote = data.data[i].fact;
          quotes.push(quote);
        }
        this.setState({
          quotes: quotes
        }, this._combineImgQuote.bind(this, 25, this._makeCatCards));
      });
    });
  }

  _getLastWord = (quote) => {
    let words = quote.split(' ');
    let word = words[words.length-1].substring(0, words.length-1);
    return word;
  }

  _combineImgQuote = (n = 25, cb = null) => {
    const {images, quotes} = this.state;
    let cats = [];
    for (let i = 0; i < n; i++) {
      let cat = {
        img: images[i],
        quote: quotes[i],
        fav: false,
        lastWord: this._getLastWord(quotes[i])
      };
      cats.push(cat);
    }
    this.setState({cats: cats}, cb);
  }

  _makeCatCards = (cats = this.state.cats, favsOnly = this.state.favsOnly) => {
    const catCardsCol1 = [];
    const catCardsCol2 = [];
    const catCardsCol3 = [];
    const noFavsNote = "You don't have any favorites yet.";
    let cols = 1;
    let favCount = 0;
    cats.forEach((cat, i) => {
      if (!favsOnly || cat.fav) {
        const catCard = (
            <div className='card' onClick={this._toggleFav.bind(this, i, favsOnly)} key={i}>
              <img src={cat.img} />
              <p className='quote'>{cat.quote}</p>
              {cat.fav ? <p className='heart full'>&#x2665;</p> : <p className='heart empty'>&#x2661;</p>}
            </div>
          );
        if (cols === 1) {
          catCardsCol1.push(catCard);
          cols++;
        } else if (cols === 2) {
          catCardsCol2.push(catCard);
          cols++;
        } else {
          catCardsCol3.push(catCard);
          cols = 1;
        }
        favCount++;
      }
    });
    const catCards = favCount ? [catCardsCol1, catCardsCol2, catCardsCol3] : [<p>{noFavsNote}</p>]
    this.setState({catCards: catCards});
  }

   _toggleFav = (catID) => {
    const {cats} = this.state;
    cats[catID].fav = !cats[catID].fav;
    this.setState({cats: cats}, this._makeCatCards);
  }

  _showAllCats = () => {
    this.setState({favsOnly: false}, this._makeCatCards.bind(this, this.state.cats, false));
  }

  _showFavoritesOnly = () => {
    this.setState({favsOnly: true}, this._makeCatCards.bind(this, this.state.cats, true));
  }

  _sortByLastWord = () => {
    let {cats} = this.state;
    let sortedCats = [];
    if (this.state.favsOnly) {
      cats = cats.filter(cat => cat.fav);
    }
    sortedCats = cats.slice().sort((a, b) => a.lastWord.toLowerCase() < b.lastWord.toLowerCase() ? -1 : 1);
    console.log('sortedCats:', sortedCats.map(cat => cat.lastWord));
    this._makeCatCards(sortedCats);
  }

  render() {

    return (
      <div className="App">
          <div className="menu">
            <button onClick={this._showAllCats}>All Cats</button>
            <button onClick={this._showFavoritesOnly}>Favorites</button>
            <button onClick={this._sortByLastWord}>Sort by last word</button>
          </div>
          <div className="catCards">
            {this.state.catCards.map((catCol, i) => <div className='catCol' key={i}>{catCol}</div>)}
          </div>
      </div>
    );
  }
}
 

export default App;

