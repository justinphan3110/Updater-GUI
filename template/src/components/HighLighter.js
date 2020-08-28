import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Popover, UncontrolledPopover,
        PopoverHeader, 
        PopoverBody, Badge, Form, FormGroup, Label, 
        Input  } from 'reactstrap';

const propTypes = {
    text: PropTypes.string.isRequired,
    customClass: PropTypes.string,
    selectionHandler: PropTypes.func
};


/**
 * Highlighter component.
 * 
 * Allows highlighting of the text selected by mouse with given custom class (or default)
 * and calls optional callback function with the following selection details:
 * - selected text
 * - selection start index 
 * - selection end index
 */
export default class HighLighter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: props.text,
            mistakes: props.mistakes, 
            isDirty: true,
            selection: '',
            anchorNode: '?',
            focusNode: '?',
            selectionStart: '?',
            selectionEnd: '?',
            first: '',
            middle: '',
            last: '',

            popoverOpen: false,
            documentID: props.documentID,
            // const popOverID = Math.random().toString(36).substring(7);

            suggestion: ''
        };
        this.onMouseUpHandler = this.onMouseUpHandler.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.text !== prevProps.text || this.props.mistakes != prevProps.mistakes || this.props.middle != prevProps.middle) {
            this.setState({
                text: this.props.text, 
                mistakes: this.props.mistakes,
                middle: this.props.middle
            });
            
        }
    }

    componentDidMount() {


        this.setState( {
            popoverOpen : false,
        })

        // console.log("mistakes", this.state.mistakes);
    }
    
    toggle() {
        console.log("toggle")
        this.setState( {
            popoverOpen : ! this.state.popoverOpen,
            suggestion : ''
        })
    }

    getCaretCharacterOffsetWithin(element, sel) {
        var caretOffset = 0;
        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        if (typeof win.getSelection != "undefined") {
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().trim().length;
            }
        } else if ( (sel = doc.selection) && sel.type != "Control") {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            console.log("textRange ", textRange)
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            caretOffset = preCaretTextRange.text.length;
        }
        return caretOffset;
    }
    
    onMouseUpHandler(e) {
        const{documentID} = this.state
        e.preventDefault();
    
        if(e.detail >= 3 || this.state.popoverOpen) return 
        const selectionObj = (window.getSelection && window.getSelection());
        const selection = selectionObj.toString().trim();

        const anchorNode = selectionObj.anchorNode;
        const focusNode = selectionObj.focusNode;
        const anchorOffset = selectionObj.anchorOffset;
        const focusOffset = selectionObj.focusOffset;
        const position = anchorNode.compareDocumentPosition(focusNode);
        let forward = false;

        if (position === anchorNode.DOCUMENT_POSITION_FOLLOWING) {
            forward = true;
        } else if (position === 0) {
            forward = (focusOffset - anchorOffset) > 0;
        }

        let selectionStart = forward ? anchorOffset : focusOffset;

        if (forward) {
            if (anchorNode.parentNode.getAttribute('data-order')
                && anchorNode.parentNode.getAttribute('data-order') === 'middle') {
                selectionStart += this.state.selectionStart;
            }
            if (anchorNode.parentNode.getAttribute('data-order')
                && anchorNode.parentNode.getAttribute('data-order') === 'last') {
                selectionStart += this.state.selectionEnd;
            }
        } else {
            if (focusNode.parentNode.getAttribute('data-order')
                && focusNode.parentNode.getAttribute('data-order') === 'middle') {
                selectionStart += this.state.selectionStart;
            }
            if (focusNode.parentNode.getAttribute('data-order')
                && focusNode.parentNode.getAttribute('data-order') === 'last') {
                selectionStart += this.state.selectionEnd;
            }
        }

        // const selectionEnd = selectionStart + selection.length;
        const selectionEnd =  this.getCaretCharacterOffsetWithin(document.getElementById("mainText"+documentID), selectionObj);
        selectionStart = this.getCaretCharacterOffsetWithin(document.getElementById("mainText"+documentID), selectionObj) - selection.length;

        const first = this.state.text.slice(0, selectionStart);
        const middle = this.state.text.slice(selectionStart, selectionEnd);
        const last = this.state.text.slice(selectionEnd);

        this.setState({
            selection,
            // anchorNode,
            // focusNode,
            selectionStart,
            selectionEnd,
            first,
            middle,
            last
        });

        if (this.props.selectionHandler) {
            this.props.selectionHandler({
                selection,
                selectionStart,
                selectionEnd
            });
        }

    }

    changeText(e) {

        this.setState( {
            middle: e.target.value
        })

        const {first, middle, last} = this.state 


        this.props.modifyText(this.props.documentIndex, first + e.target.value + last)
    }

    suggestContext() {
        const {mistakes, selectionStart, middle, documentID} = this.state
        

        let suggests = []
        mistakes.forEach(mistake => {
            if(mistake.start_offset == selectionStart && middle == mistake.text){
                suggests = mistake.suggest
            }
        });

        let suggestButtons = []
        suggests.forEach(suggest => {
            let b = <span><Button 
                        id={documentID + Math.random()}
                        size="sm"
                        outline
                        value={suggest[0]}
                        color="success"
                        onClick={this.handleDeleteSuggestion.bind(this)}
                    >
                        {suggest[0]}
                        ---{Math.round(suggest[1]*100)/100}
                    </Button>
                    </span>
            suggestButtons.push(b)
        })

        // suggestButtons.push()

        return suggestButtons;
    }

    handleSubmitMistake(e) {
        
        const {documentIndex, addMistakeAndCorrection} = this.props;
        const {suggestion, middle, selectionStart} = this.state
        e.preventDefault()

        addMistakeAndCorrection(documentIndex, middle, selectionStart, suggestion)
    }

    handleDeleteSuggestion(e) {
        const {documentIndex, deleteSuggestion} = this.props;
        const {suggestion, middle, selectionStart} = this.state

        deleteSuggestion(documentIndex, selectionStart, e.target.value);
    }

    handleDeleteMistake(e) {
        const {documentIndex, deleteMistake} = this.props;
        const {suggestion, middle, selectionStart} = this.state;        
        deleteMistake(documentIndex, selectionStart)
        this.setState({
            selection: ''
        })
        this.toggle()
        // this.toggle()
    }

    popOver() {
        // let s = this.suggestContext.bind(this)
        const {documentID, mistakes, selectionStart, middle} = this.state

        let suggest = this.suggestContext()

        return <UncontrolledPopover trigger="legacy" 
                        placement="top" target={documentID} isOpen={this.state.popoverOpen} toggle={this.toggle.bind(this)}>
                                    <PopoverHeader>
                                        <Form onSubmit={this.handleSubmitMistake.bind(this)}>
                                        <FormGroup>
                                            <Label for="exampleEmail">{this.state.middle}</Label>
                                            <Button id={"s" + Math.random} onClick={this.handleDeleteMistake.bind(this)} 
                                                color="danger"
                                                size="sm">-</Button>
                                            <Input placeholder="add an suggestion" value={this.state.suggestion} 
                                                onChange={(e) => this.setState({
                                                suggestion: e.target.value})} />
                                        </FormGroup>
                                            
                                            {/* <Button style={{border: 0, "color": "black", "padding": "5%"}} 
                                                size="sm" 
                                                color="success" >
                                                    +
                                            </Button> */}
                                        </Form>
                                    </PopoverHeader>

                                    <PopoverBody>{suggest}</PopoverBody>
                </UncontrolledPopover > 
    }


    BoldedText(text, mistakes) {
        // const {mistakes} = this.state;

        // const textArray = text.split("chính");
        let textArray = []

        let mistakeIndex = mistakes.map(mistake => {
            return [mistake.start_offset, mistake.start_offset + mistake.text.length];
        })
        
        mistakeIndex = mistakeIndex.sort( function(a, b) {
            return (a[0] - b[0]);
        });
        
        let left = 0;
        let mistakesArray = [];
        
        mistakeIndex.map(index => {
            textArray.push(text.slice(left, index[0]))
            left = index[1];
            mistakesArray.push(text.slice(index[0], index[1]));
        })

        if(left < text.length) {
            textArray.push(text.slice(left));
        }
        
        // console.log(mistakeIndex)
        // console.log(textArray)
        // console.log(mistakesArray)

        return (
          <span>
            {textArray.map((item, index) => (
              <>
                {item}
                {index !== textArray.length - 1 && mistakeIndex && (
                  <span style={{color:"red"}}>{mistakesArray.shift()}</span>
                )}
              </>
            ))}
          </span>
      );
      }

    render() {
        const {documentID, text , mistakes} = this.state

        if (!this.state.selection) {
            return (
                <React.Fragment>
                <span id={"mainText"+documentID}
                    onMouseUp={this.onMouseUpHandler}>
                        {/* {this.splitSentence(this.state.text).map(item => {return <span> {item} </span>})} */}
                        {this.BoldedText(text, mistakes)}
                </span>
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                <span id={"mainText" + documentID}
                
                    onMouseUp={this.onMouseUpHandler.bind(this)}>
                    <span
                        data-order="first" >
                        {this.state.first}
                    </span>                    
                    <span  
                        data-order="middle"
                        >

                        <Button onClick={this.toggle.bind(this)}
                                onMouseEnter={this.toggle.bind(this)}
                                style={{border: 0, "color": "black", "padding": "0.4%"}} 
                                outline  
                                size="sm" 
                                color="danger" 
                                id={documentID}
                            > {this.state.middle} 
                        </Button>
                        
                        {document.getElementById(documentID) && this.state.mistakes && this.state.middle &&
                            this.popOver()    
                        }
                    </span>
                    <span
                        data-order="last">
                        {this.state.last}
                    </span>
                </span>
                </React.Fragment>
            )
        }

    }
}

HighLighter.propTypes = propTypes;