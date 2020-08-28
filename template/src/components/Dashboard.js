import React, { Component } from 'react'
import {
    Card, FormGroup, Container, Input,
    CardTitle, Row, Col, 
    Button, Jumbotron
  } from 'reactstrap';
import CheckedItem from './CheckedItem';
  
export default class Dashboard extends Component {
    constructor(props) {
        super(props)

        this.state = {
            input: 'testttt',
            output: [],
            checkedItem: [],
            showingResult: false,

        }
    }

    inputChange(e) {
        this.setState ({
            input: e.target.value
        })
    }


    spellingCheck() {
        console.log("spelling checking");
        const test1 = {
            text: "Trên mạng xã hội, người hâm mộ bày tỏ sự đồng cảm với chủ nhân hit Người lạ ơi khi anh bộc bạch sự day dứt khi phải chia tay bạn gái. \"Anh chỉ muốn em biết rằng phải khó khăn biết chừng nào khi phải chính miệng nói ra hai chữ 'dừng lại'. Nó chưa bao giờ là dễ dàng với anh, ngay cả khi đứng trước mặt em lẫn khi viết ra những lời này\", Karik chia sẻ." 
            , mistakes: [{text: "chính", start_offset: 199, score: 0.756, suggest: [["chích", 0.985]]}]
        }
        

        let checkedItem = [test1].map((item) => {
            return <CheckedItem key={item.text + Math.random()} text={item.text} mistakes={item.mistakes}/>
        });

        this.setState( {
            showingResult: true,
            checkedItem: checkedItem
        })

        console.log("in speliing  check : " + this.state.checkedItem.length);
    }

    result() {
        console.log("in result: " + this.state.checkedItem)
        return (
            <React.Fragment>
                    <h5>Kết quả kiểm tra: Tìm thấy <span className="text-danger"> 13</span> lỗi</h5>
                    <Row>
                        {this.state.checkedItem}
                    </Row>
            </React.Fragment>        
        )
    }
    render() {
        let checkedItem = this.state.output.map((item) => {
            return <CheckedItem key={item.text + Math.random()} text={item.text} mistakes={item.mistakes}/>
        });

        var Keypress = require("react-keypress");
        return (
        <React.Fragment>
            <Jumbotron style={{width: "100%", backgroundColor: '#f1f1f1'}}>
                <Container>
                {/* <React.Fragment style={{backgroundColor: '#f1f1f1'}}> */}
                    <h3 className="display-3">Kiểm tra chính tả tiếng việt!</h3>
                    <hr className="my-2" />
                    <h4>Đoạn văn cần kiểm tra chính tả</h4>
                    <Row style={{width: "auto"}}>
                        <Col>
                            <FormGroup>
                                {/* <Label for="exampleText">Text Area</Label> */}
                                <Input rows={10} type="textarea" name="text" id="exampleText" 
                                    value={this.state.input} 
                                    onChange={this.inputChange.bind(this)}
                                    // onKeyPress={Keypress("enter ctrl", console.log("hello"))}
                                />
                                {/* <Button color="primary" style={} size="lg">Large Button</Button>{' '} */}
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col><Button color="primary" size="lg" onClick={this.spellingCheck.bind(this)}>Kiểm tra</Button></Col>
                    </Row>
                </Container>
                <Container style={{padding: '1%'}}>
                    {this.state.showingResult && this.result()}
                </Container>

            </Jumbotron>

            
        </React.Fragment>
        )
    }
}
