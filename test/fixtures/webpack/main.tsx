import React, {Component} from 'react';
const img =require('file-loader!./1.png')
// console.log(add(sub(1,2),1))


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
