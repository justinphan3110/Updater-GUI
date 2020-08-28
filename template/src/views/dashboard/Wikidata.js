import React, { Component } from 'react'
import {
    Col,
    Row,
  } from 'reactstrap';

import {
CBadge,
CButton,
CButtonGroup,
CCard,
CCardBody,
CCardFooter,
CCardHeader,
CCol,
CProgress,
CRow,
CCallout
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import axios from 'axios';
import WikiDataItem from '../items/WikiDataItem';



export default class Wikidata extends Component {
    constructor() {
        super()

        this.state = {
            data: [], 
        }
    }


    componentDidMount() {
        const params ={ 
            type: '', 
            q: '',
            page: 1,
            sort: 'DEFAULT',
        }
        this.fetch_wiki_data(params);
    }


    fetch_wiki_data(params) {
        const BASE_URL = process.env.REACT_APP_REST_CONNECTION + 'get-wikidata-entities';        
        axios.get(BASE_URL, {
            params
        }).then((response) => {
            console.log("fetch wiki data success");
            this.setState( {
                data: response.data.data.items.map((i)=> i.data), 
                next: response.data.data.next, 
                prev: response.data.data.prev,
                page: response.data.data.page,
            }, () => console.log(this.state.data))

        }).catch((error) => {
            console.log("fetch wiki data failed")
        });
    }


    render() {
        const items = this.state.data.map((item) => {
            return <WikiDataItem item={item}/>
        })



        return (
            <div>
                <CRow>
                    <CCol  md={{ size: 6, offset: 0 }}>
                        <h2>Ki-Ki Base Wikidata</h2>
                    </CCol>
                </CRow>
            <br/>
            
            <CRow>
            <CCol>
            <CCard>
                <CCardHeader>
                <h4 class="text-body">Entity management</h4>
                </CCardHeader>
                <CCardBody>
                <br />

                <table className="table table-hover table-striped table-borderless mb-0 d-none d-sm-table">
                    <thead className="thead-light">
                    <tr>
                        {/* <th className="text-center"><CIcon name="cil-people" /></th> */}
                        <th class="text-black-60" scope="col">wikidata_id</th>
                        <th class="text-black-60" scope="col">type</th>
                        <th class="text-black-60" scope="col">title</th>
                        <th class="text-black-60" scope="col">aliases</th>
                        <th class="text-black-60" scope="col">pageview</th>
                        <th class="text-black-60" scope="col">lastUpdated</th>
                        <th class="text-black-60" scope="col">actions</th>
                    </tr>
                    </thead>
                    <tbody>
                       {items}
                    </tbody>
                </table>

                </CCardBody>
            </CCard>
            </CCol>
        </CRow>
              

                
            </div>
        )
    }
}
