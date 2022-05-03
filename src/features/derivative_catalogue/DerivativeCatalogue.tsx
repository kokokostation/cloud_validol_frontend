import React, {useMemo, useState} from 'react';
import produce from 'immer';

import styles from './DerivativeCatalogue.module.css';
import {DerivativeInfo, DerivativeName, GetSeriesResponse, UpdateSeriesStartRequest} from '../../services/series/types';
import {useGetSeriesQuery, useUpdateSeriesMutation} from '../../services/series/api';

import Select from 'react-select';
import {ClimbingBoxLoader} from 'react-spinners';

interface DerivativeNameIndex {
    [derivative_name: string]: DerivativeInfo
}

interface DerivativeIndex {
    [platform_source: string]: {
        [platform_code: string]: DerivativeNameIndex
    }
}

function getDerivativeIndex(response: GetSeriesResponse): DerivativeIndex {
    const derivativeIndex: DerivativeIndex = {};

    for (let item of response['derivatives']) {
        let path: any = derivativeIndex;
        for (let key of ['platform_source', 'platform_code']) {
            const value = item.name[key as keyof DerivativeName];
            path = path[value] ?? (path[value] = {});
        }
        path[item.name.derivative_name] = item.info;
    }

    return derivativeIndex;
}

function getDerivatives(
    platformSource: string | null,
    platformCode: string | null,
    derivativeIndex: DerivativeIndex
): DerivativeNameIndex {
    if (platformSource && platformCode) {
        return derivativeIndex[platformSource][platformCode];
    }

    return {};
}

function makeUpdateSeriesStartRequest(derivativeIndex: DerivativeIndex): UpdateSeriesStartRequest {
    const derivatives: DerivativeInfo[] = Object.values(derivativeIndex).flatMap(
        item => Object.values(item).flatMap(
            item => Object.values(item)));

    return {derivatives};
}

export function DerivativeCatalogue() {
    const [derivativeIndex, setDerivativeIndex] = useState<DerivativeIndex>({});
    const [platformSource, setPlatformSource] = useState<null | string>(null);
    const [platformCode, setPlatformCode] = useState<null | string>(null);

    const {data: getSeriesResponse, isLoading: isSeriesLoading} = useGetSeriesQuery();
    useMemo(
        () => getSeriesResponse && setDerivativeIndex(getDerivativeIndex(getSeriesResponse)),
        [getSeriesResponse]
    );

    const [updateSeries, {isLoading: isSeriesUpdating}] = useUpdateSeriesMutation();

    const platformSourcesOptions = useMemo(
        () => Object.keys(derivativeIndex)
            .map(item => ({label: item, value: item})),
        [derivativeIndex]
    );
    const platformCodesOptions = useMemo(
        () => (platformSource ? Object.keys(derivativeIndex[platformSource]) : [])
            .map(item => ({label: item, value: item})),
        [platformSource, derivativeIndex]
    );
    const derivativeOptions = useMemo(
        () => Object.keys(getDerivatives(platformSource, platformCode, derivativeIndex))
            .map(item => ({label: item, value: item})),
        [platformSource, platformCode, derivativeIndex]
    )
    const derivativeValues = useMemo(
        () => Object.entries(getDerivatives(platformSource, platformCode, derivativeIndex))
            .filter(([_, value]) => value.visible)
            .map(([key, _]) => ({label: key, value: key})),
        [platformSource, platformCode, derivativeIndex]
    )

    return (
        <div>
            <div className={styles.selectors}>
                <button
                    className={styles.save_button}
                    disabled={isSeriesUpdating}
                    onClick={() => {
                        updateSeries(makeUpdateSeriesStartRequest(derivativeIndex));
                    }}>
                    Save
                </button>
                <Select
                    options={platformSourcesOptions}
                    isSearchable
                    onChange={selectedOption => {
                        if (selectedOption) {
                            setPlatformSource(selectedOption.value);
                        }

                        setPlatformCode(null);
                    }}
                />
                <Select
                    options={platformCodesOptions}
                    value={platformCode && {label: platformCode, value: platformCode}}
                    isSearchable
                    onChange={selectedOption => selectedOption && setPlatformCode(selectedOption.value)}
                />
                <Select
                    className={styles.derivative_selector}
                    options={derivativeOptions}
                    value={derivativeValues}
                    isMulti
                    isSearchable
                    onChange={selectedOptions => {
                        setDerivativeIndex(
                            produce(
                                derivativeIndex, draft => {
                                    const derivatives = getDerivatives(platformSource, platformCode, draft);
                                    Object.values(derivatives).forEach(item => {
                                        item.visible = false;
                                    });
                                    selectedOptions.forEach(item => {
                                        derivatives[item.value].visible = true;
                                    });
                                }
                            )
                        )
                    }}
                />
            </div>
            <div className={styles.loader}>
                <ClimbingBoxLoader loading={isSeriesLoading || isSeriesUpdating}/>
            </div>
        </div>
    );
}
