import {createSlice} from '@reduxjs/toolkit'

import {DatasetIndex} from './types';
import {GetAtomsResponse} from '../../services/atoms/types';

const initialState: DatasetIndex = {};

const atomListSlice = createSlice({
    name: 'datasets',
    initialState,
    reducers: {
        datasetsFetched(state, action) {
            const data = action.payload as GetAtomsResponse;

            return Object.fromEntries(
                data.datasets.map(
                    item => [
                        item.superset_id,
                        {
                            ...item,
                            columns: Object.fromEntries(
                                item.columns.map(item => [item.name, item])
                            )
                        }
                    ]
                )
            );
        }
    }
})

export const {datasetsFetched} = atomListSlice.actions;

export default atomListSlice.reducer;
