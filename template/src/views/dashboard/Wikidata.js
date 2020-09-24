import React, { Component } from 'react'

import {
CCard,
CCardBody,
CCardHeader,
CCol,
CRow,

} from '@coreui/react'

import axios from 'axios';
import WikiDataItem from '../items/WikiDataItem';
import WikiDataManage from '../../manage/WikiDataManage';
import WikiDataUpdater from '../../manage/WikiDataUpdater';



export default class Wikidata extends Component {
    constructor() {
        super()

        this.state = {
            data: [],
            
            // fetch wikidata
            page: 1,
            sort: 'DEFAULT',
            type: '',
            q: ''
        }

        this.removeEntity = this.removeEntity.bind(this)
    }


    componentDidMount() {
        const {type, page, sort, q} = this.state;

        this.fetch_wiki_data({type, page, sort, q});
    }

    componentDidUpdate(prevProps, prevStates) {
        if(this.state.data !== prevStates.data) {
            this.setState({
                data: this.state.data
            })
        }
    }

    setPage(page) {
        this.setState({page: page});
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


    removeEntity(id) {
        // const new_data = this.state.data.filter(item => item.wikidata_id !== id);
        this.setState({
            data: this.state.data.filter(item => item.wikidata_id != id )
        });
    }


    render() {
        var items = this.state.data.map((item) => {
            return <WikiDataItem 
                    key={item.wikidata_id}
                    removeEntity={this.removeEntity}
                    item={item}/>
        })

        const {type, page, sort, q} = this.state;
        const params = {type, page, sort, q};



        return (
            <div>
                <CRow>
                    <CCol  md={{ size: 6, offset: 0 }}>
                        <h2>Ki-Ki Base Wikidata</h2>
                    </CCol>
                </CRow>
            <br/>
            
            <WikiDataUpdater/>

        

            <CRow>
            <CCol>
            <CCard>
                <CCardHeader>
                    <WikiDataManage header={'Entity Management'}
                                    fetch_wiki_data={this.fetch_wiki_data.bind(this)} 
                                    params={params}/>
                </CCardHeader>
                <CCardBody>
                <br />

                <table className="table table-hover table-striped table-borderless mb-0 d-none d-sm-table">
                    <thead className="thead-light">
                    <tr>
                        {/* <th className="text-center"><CIcon name="cil-people" /></th> */}
                        <th className="text-black-60" scope="col">wikidata_id</th>
                        <th className="text-black-60" scope="col">type</th>
                        <th className="text-black-60" scope="col">title</th>
                        <th className="text-black-60" scope="col">aliases</th>
                        <th className="text-black-60" scope="col">pageview</th>
                        <th className="text-black-60" scope="col">lastUpdated</th>
                        <th className="text-black-60" scope="col">actions</th>
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
