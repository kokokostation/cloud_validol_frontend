import React, {useState} from 'react';
import {useGetAtomsQuery, usePushAtomsMutation} from '../../services/atoms/api';

import styles from './AtomList.module.css'
import Select from 'react-select';
import {Button, Divider,} from '@mui/material';
import {useAppSelector} from '../../app/hooks';
import Box from '@mui/material/Box';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {PushColumn} from "../../services/atoms/types";
import {AtomEditor} from "../atom_editor/AtomEditor";


const COLUMNS: GridColDef[] = [
    {
        field: 'name',
        headerName: 'Name',
        description: 'Atom name',
        flex: 3
    },
    {
        field: 'state',
        headerName: 'State',
        description: 'Atom state with respect to superset',
        flex: 2
    },
    {
        field: 'user_expression',
        headerName: 'User expression',
        description: 'Atom expression, provided by user',
        flex: 3
    },
    {
        field: 'basic_atoms_expression',
        headerName: 'Reduced user expression',
        description: 'Atom expression, provided by user, expressed through superset dataset metrics',
        flex: 5
    },
    {
        field: 'superset_expression',
        headerName: 'Superset expression',
        description: 'Atom expression, currently present in superset',
        flex: 5
    }
];


export function AtomList() {
    const [supersetDatasetId, setSupersetDatasetId] = useState<number | null>(null);
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

    const datasets = useAppSelector(state => state.datasets);

    const {isLoading: isAtomsLoading} = useGetAtomsQuery();
    const [pushAtoms, {isLoading: isAtomsUpdated}] = usePushAtomsMutation();

    return (
        <>
            <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                <Box sx={{display: 'flex', flexDirection: 'row'}}>
                    <Box sx={{display: 'flex', flexDirection: 'row', width: '50%', marginRight: '10px'}}>
                        <Button
                            disabled={selectedColumns.length === 0}
                            onClick={() => {
                                if (!supersetDatasetId || !selectedColumns) {
                                    return;
                                }

                                pushAtoms({
                                    superset_dataset_id: Number(supersetDatasetId),
                                    columns: selectedColumns.map(
                                        name => ({
                                            name,
                                            basic_atoms_expression: datasets[supersetDatasetId].columns[name].user_expression?.basic_atoms_expression
                                        })
                                    ).filter(
                                        column => !!column.basic_atoms_expression
                                    ) as PushColumn[]
                                })
                            }}
                        >
                            Push to superset
                        </Button>
                        <Select
                            className={styles.select}
                            options={Object.entries(datasets).map(([superset_id, {name}]) => ({
                                label: name,
                                value: superset_id
                            }))}
                            isSearchable
                            onChange={selectedOption => {
                                setSupersetDatasetId(selectedOption && Number(selectedOption.value));
                                setSelectedColumns([]);
                            }}
                        />
                    </Box>
                    <Divider
                        orientation={'vertical'}
                    />
                    <Box sx={{width: '50%', marginLeft: '20px'}}>
                        <AtomEditor
                            supersetDatasetId={supersetDatasetId}
                        />
                    </Box>
                </Box>
                {supersetDatasetId &&
                <Box sx={{flexGrow: 1, flexBasis: 'auto'}}>
                  <DataGrid sx={{height: '100%'}}
                            rows={
                                Object.values(datasets[supersetDatasetId].columns).map((column) => ({
                                    name: column.name,
                                    state: column.state,
                                    user_expression: column.user_expression?.expression,
                                    basic_atoms_expression: column.user_expression?.basic_atoms_expression,
                                    superset_expression: column.superset_expression?.expression,
                                }))
                            }
                            columns={COLUMNS}
                            pageSize={10}
                            checkboxSelection
                            onSelectionModelChange={(ids) => setSelectedColumns(ids as string[])}
                            disableSelectionOnClick
                            getRowId={row => row.name}
                  />
                </Box>
                }
            </Box>
        </>
    );
}
