import React, { Component } from 'react'
import { Spin, Alert } from 'antd';
import {
    CBadge,
    CCol,
    CRow,    
    CButton, 
    CDropdown,
    CDropdownItem,
    CDropdownMenu,
    CDropdownToggle,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CCard,
    CCardBody,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import ReactJson from 'react-json-view'


export default class WikiDataKafka extends Component {
    constructor() {
        super()
        this.state = {
            connectedWS: false,
            ws: null,

            deletedItems: [],
            addItems: [],
            viewNewEntity: false,
            viewIndex: undefined,

        }
    }

    componentDidMount() {
        this.connect();

        console.log(this.state.deletedItems);
    }

    componentDidUpdate(prevProps, prevStates) {
        if(this.state.deletedItems !== prevStates.deletedItems) {
            this.setState({
                deletedItems: this.state.deletedItems
            })
        }
    }

    toggleViewNewEntity(index) {
        this.setState( { viewNewEntity: ! this.state.viewNewEntity, viewIndex: index});
    }

    toggleConnectWs(boo) {
        console.log(boo);
        this.setState( {connectedWS: boo});
    }
    
    timeout = 250; // Initial timeout duration as a class variable

    /**
     * @function connect
     * This function establishes the connect with the websocket and also ensures constant reconnection if connection closes
     */
    connect = () => {
        
        var ws = new WebSocket("ws://localhost:3001/consumer");
        let that = this; // cache the this
        var connectInterval;

        // websocket onopen event listener
        ws.onopen = () => {
            
            this.toggleConnectWs.bind(this,true);
            console.log("connected websocket WikiData component");
            ws.send('ner-incremental-local');
            this.setState({ ws: ws });
            that.timeout = 250; // reset timer to 250 on open of websocket connection 
            clearTimeout(connectInterval); // clear Interval on on open of websocket connection
        };

        // websocket onclose event listener
        ws.onclose = e => {
            this.toggleConnectWs.bind(this,false);

            console.log(
                `Socket is closed. Reconnect will be attempted in ${Math.min(
                    10000 / 1000,
                    (that.timeout + that.timeout) / 1000
                )} second.`,
                e.reason
            );
            that.timeout = that.timeout + that.timeout; //increment retry interval
            connectInterval = setTimeout(this.check, Math.min(10000, that.timeout)); //call check function after timeout
        };

        // websocket onerror event listener
        ws.onerror = err => {

            this.toggleConnectWs.bind(this,false);

            console.error(
                "Socket encountered error: ",
                err.message,
                "Closing socket"
            );

            ws.close();
        };

        // websocket on message
        ws.onmessage = (e) => {
            console.log(e.data);
            var data = JSON.parse(e.data);

            switch(data.actionType) {
                case "DELETE": 
                    this.setState({ deletedItems: [...this.state.deletedItems, data]});
                    break;
                case "ADD": 
                    this.setState({ addItems : [...this.state.addItems, data]});
                    break;
                default: 
                    break;
            }
        }
    };

    /**
     * utilited by the @function connect to check if the connection is close, if so attempts to reconnect
     */
    check = () => {
        const { ws } = this.state;
        if (!ws || ws.readyState == WebSocket.CLOSED) this.connect(); //check if websocket instance is closed, if so call `connect` function.
    };

    timeStampsToDate(timeStamp){
        if(timeStamp === undefined) return undefined

        var d = new Date(timeStamp);
        return d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    }

    render() {
        const itemsCount = 5;
        return (
            <React.Fragment>
                <CRow>
                    <CCol sm="5">
                        <h4 className="text-body">Entity management</h4>
                        <Spin spinning={this.state.connectedWS}>
                            <CBadge className="small" key={Math.random()} color={"success"}> {"Connected to Kafka Websocket"}</CBadge>
                        </Spin>
                    </CCol>

                    <CCol sm="7" className="d-none d-md-block">
                        <CDropdown
                            // inNav
                            className="float-right c-header-nav-item mx-2"
                        >
                            <CDropdownToggle className="c-header-nav-link" caret={false}>
                                <CIcon name="cil-bell"/>
                                <CBadge shape="pill" color="danger">{itemsCount}</CBadge>
                            </CDropdownToggle>
                            <CDropdownMenu  placement="bottom-end" className="pt-0">

                                {/* Delete */}
                                <CDropdownItem
                                    header
                                    tag="div"
                                    className="text-center"
                                    color="light"
                                >
                                    <strong>You have {this.state.deletedItems.length} new deletes</strong>
                                </CDropdownItem>

                                {this.state.deletedItems
                                            .map(i => 
                                                    <CDropdownItem>
                                                        <CRow>
                                                            <CIcon name="cil-trash" className="mr-2 text-danger" />
                                                            <div className="text-uppercase mb-1">{i.entityID}</div>
                                                            <small className="text-muted">Time:{this.timeStampsToDate(i.time)}</small>
                                                        </CRow>
                                                    </CDropdownItem>)}


                                                    {/* <CDropdownMenu  placement="bottom-end" className="pt-0"> */}

                                {/* ADD */}
                                <CDropdownItem
                                    header
                                    tag="div"
                                    className="text-center"
                                    color="light"
                                >
                                    <strong>You have {this.state.addItems.length} new entities</strong>
                                </CDropdownItem>

                                {this.state.addItems
                                            .map((i,index) => 
                                                    <CDropdownItem>
                                                        <CRow onClick={this.toggleViewNewEntity.bind(this, index)}>
                                                            <CIcon name="cil-user-follow" className="mr-2 text-success" />
                                                            <div className="text-uppercase mb-1">{i.type}</div>
                                                            <small className="text-muted">{this.timeStampsToDate(i.time) ? "Time: " + this.timeStampsToDate(i.time): ""}</small>
                                                        </CRow>
                                                    </CDropdownItem>)}
                                {/* </CDropdownMenu> */}
                            </CDropdownMenu>
                        </CDropdown>
                    </CCol>
                </CRow>

                <CModal 
                show={this.state.viewNewEntity} 
                onClose={this.toggleViewNewEntity.bind(this)}
                color="info"
                >
                <CModalHeader closeButton>
                    <CModalTitle>
                        Details Information
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <ReactJson src={this.state.addItems[this.state.viewIndex]} theme="summerfruit:inverted" iconStyle="triangle" />
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={this.toggleViewNewEntity.bind(this)}>close</CButton>
                </CModalFooter>
                </CModal>
            </React.Fragment>
        )
    }
}
