import React, { Component } from 'react'
import {Row, Col, Button, Container} from 'reactstrap'
import HighLighter from './HighLighter';

export default class CheckedItem extends Component {
    constructor(props) {
        super(props);
        
        const {text, mistakes} = this.props;

        this.state = {
            text, 
            mistakes,
            splited_sentence: []
        }

    }

    componentDidUpdate(prevProps, prevStates) {
        if (this.props.text !== prevProps.text || this.props.mistakes != prevProps.mistakes) {
            this.setState({
                text: this.props.text, 
                mistakes: this.props.mistakes
            });
            
        }

        if(this.state.mistakes !== prevStates.mistakes) {
            this.setState({
                mistakes: this.state.mistakes
            })
        }
    }

    componentDidMount() {
    }

    
    clickWord(e) {
        console.log("click " + e.target.value)
    }

    arrayofButton(text) {
        var array = text.split(" ");
        var buttonArray = []

        var i;
        for(i = 0; i < array.length; i++) {
            const currentIndex = i;
            var item = <Button onClick={this.clickWord.bind(this)} 
                            value={[array[i], currentIndex]} 
                            style={{border: 0, "boxShadow": 'none', "color": "black", "padding": "0.4%"}} 
                            outline  size="sm" 
                            color="secondary" 
                            id={i + Math.random()}> {array[i]} </Button>
            buttonArray.push(item)
        }

        return buttonArray;
    }

    mistakeItem(text, suggest) {
        return (
            <React.Fragment>
                <Button size="sm" color="warning" id={text + suggest}>
                    {text}
                </Button>
            </React.Fragment>
        )
    }

    // getMistake () {
    //     const {mistakes} = this.state;
        
    //     for
    // }

    selectionHandler(selection) {
        const {selectionStart, selectionEnd } = selection
        const selection_text = selection.selection

        if(selection_text === "" || selection_text === this.state.text)
            return
        //do something with selection
        console.log(selection);
        console.log(selectionStart, selectionEnd);
        // const {selecttionStart, selectionEnd } = selection
        let text = this.state.text

        String.prototype.replaceBetween = function(start, end, what) {

            return this.substring(0, start) + what + this.substring(end);

        };

        let replaced_sentene = text.replaceBetween(selectionStart, selectionEnd, "test")

        // this.setState({text: replaced_sentene} , console.log(replaced_sentene))

        // this.setState({ text: replaced_sentene},() => {
        //     console.log(this.state.text)
        //   });

        // console.log(replaced_sentene);
        // console.log(this.state.text)
          
    }

    

    render() {
        // console.log(this.state.splited_sentence)
        const {documentID} = this.props
        const {text, mistakes} = this.state

        return (
            <React.Fragment>
                <hr className="my-2" />
                <Container style={{padding: "1%", width: "auto", backgroundColor: "#FFFFFF"}}>
                        {/* {this.state.splited_sentence} */}
                        <HighLighter 
                            innerHTML={true}
                            text={text}
                            mistakes={mistakes}
                            addMistakeAndCorrection={this.props.addMistakeAndCorrection}
                            deleteSuggestion={this.props.deleteSuggestion}
                            deleteMistake={this.props.deleteMistake}
                            documentIndex={this.props.documentIndex}
                            documentID={documentID}
                            selectionHandler={this.selectionHandler.bind(this)}
                            customClass="highlighter-class"
                        />
                </Container>
            </React.Fragment>
        )   
    }
}
