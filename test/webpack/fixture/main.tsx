import React, {Component} from 'react';
const img = require('./1.png')

export default class MainComponent extends Component {
  render() {
    return (
      <div style={styles.container}>
        download
        <img src={img}/>
      </div>
    )
  }
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
  }
}
