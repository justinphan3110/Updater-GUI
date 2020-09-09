import React, { Component } from 'react'
import {
    CBadge,
    CCollapse,
    CButtonGroup,
    // CIcon,
    CButton,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CCard,
    CCardHeader,
    CCardBody,
    CForm,
    CFormGroup,
    CLabel,
    CInput,
    CInvalidFeedback,
    CValidFeedback,

    

} from '@coreui/react'
import  CIcon from '@coreui/icons-react'
import axios from 'axios';


export default class WikiDataItem extends Component {
    constructor(props) {
        super(props)
        const {item} = this.props;
        
        
        this.state = {
            item,
            laban_wiki_base_item_url : process.env.REACT_APP_WIKI_BASE_LABAN_ITEM + item.wikidata_id,
            //delete info
            deleteModal: false,
            deletedReason: ''
        }
    }

    componentDidMount() {
        // console.log(process.env);
    }

    timeStampsToDate(timeStamp){
        var d = new Date(timeStamp);
        return d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
    }

    badges(typeArray, color) {
        return <span>{typeArray.map((s) => <CBadge key={Math.random()} color={color} style={{marginLeft: '2%'}}> {s}</CBadge> )}</span>
    }

    deteteToggle() {
        this.setState( {
            deleteModal: ! this.state.deleteModal
        })
    }

    delete_wikidata_entity() {
        const {wikidata_id} = this.state.item
        const {removeEntity} = this.props

        const BASE_URL = process.env.REACT_APP_REST_CONNECTION + 'delete-wikidata-entity';        
        const params = {wikidata_id, reason: this.state.deletedReason}
        axios.get(BASE_URL, {
            params
        }).then(() => {
            console.log("delete wiki data " + wikidata_id + " success");
            removeEntity(wikidata_id)

        }).catch(() => {
            console.log("delete wiki data " + wikidata_id + "failed");
        });

        this.setState( {
            deleteModal: ! this.state.deleteModal
        })
    }
    
    
    
    render() {
        const {laban_wiki_base_item_url, item} = this.state
        const {wikidata_id, aliases, page_view, title, type, created_time, updated_time} = item



        return (
            <React.Fragment>
                <tr key={wikidata_id}>
                    <td><p><a href={laban_wiki_base_item_url} target="_blank" style={{ color: '#8A2BE2' }}>{wikidata_id}</a></p></td>
                    <td>{this.badges(type, 'success')}</td>
                    <td className="text-muted">{title}</td>
                    <td>{this.badges(aliases, 'blue')}</td>
                    <td>{page_view}</td>
                    <td>{updated_time ? this.timeStampsToDate(updated_time) : this.timeStampsToDate(created_time)}</td>
                    <td style={{width: "10%"}}>   
                        <CButton
                            className="btn btn-sm btn-outline-success"
                            title="Fetch"
                        >
                            <CIcon name="cil-cloud-download"/>
                        </CButton>

                        <CButton
                            className="btn btn-sm btn-outline-primary"
                            title="Edit"
                            style={{marginLeft: "0%"}}
                        >
                            <CIcon name="cil-pencil" alt="Settings" />
                        </CButton>

                        <CButton
                            onClick={this.deteteToggle.bind(this)}
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                            style={{marginLeft: "0%"}}
                        >
                            <CIcon name="cil-trash"/>
                        </CButton>
                                                                                  
                    </td>
                </tr>


                <CModal 
                    show={this.state.deleteModal} 
                    onClose={this.deteteToggle.bind(this)}
                    color="danger"
                >
                    <CModalHeader closeButton>
                        <CModalTitle>
                            Delete WikiData Entity <span className="badge badge-warning">{title}</span> {<CBadge key={Math.random()} color={"success"}> {wikidata_id}</CBadge>}
                        </CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <CCard>
                            <CCardHeader>
                                Please provide a reason for deleting {<CBadge key={Math.random()} color={"success"}> {wikidata_id}</CBadge>} entity
                            </CCardHeader>
                            <CCardBody>
                            <CForm className="was-validated">
                                <CFormGroup>
                                    <CLabel htmlFor="inputWarning2i">Reason</CLabel>
                                    <CInput value={this.state.deletedReason} 
                                            className="form-control-warning" id="inputWarning2i" required 
                                            onChange={(e) => this.setState({deletedReason: e.target.value})}/>

                                    <CInvalidFeedback className="help-block">
                                        Please provide a valid reason
                                    </CInvalidFeedback>

                                    <CValidFeedback className="help-block"/>
                                    
                                </CFormGroup>
                            </CForm>
                            </CCardBody>
                        </CCard>
                    </CModalBody>
                    <CModalFooter>
                        <CButton disabled={!this.state.deletedReason} color="danger" onClick={this.delete_wikidata_entity.bind(this)}>Delete</CButton>{' '}
                        <CButton color="secondary" onClick={this.deteteToggle.bind(this)}>Cancel</CButton>
                    </CModalFooter>
                </CModal>
            </React.Fragment>
        )
    }
}
