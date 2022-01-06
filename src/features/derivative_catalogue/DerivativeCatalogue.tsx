import React, { useState, useEffect, useCallback } from 'react';

import styles from './DerivativeCatalogue.module.css';
import {getSeries, putSeries, DerivativeInfo, DerivativeName} from './derivativeCatalogueAPI';

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

function makeOptions(derivatives: DerivativeNameIndex): {value: DerivativeInfo, label: string}[] {
    return Object.entries(derivatives).map(([key, value]) => ({value: value, label: key}))
}

async function getDerivativeIndex(): Promise<DerivativeIndex> {
    const response = await getSeries();
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

async function putDerivativeIndex(derivativeIndex: DerivativeIndex) {
    const derivatives: DerivativeInfo[] = Object.values(derivativeIndex).flatMap(
        item => Object.values(item).flatMap(
            item => Object.values(item)));

    await putSeries({derivatives});
}

export function DerivativeCatalogue() {
    const [derivativeIndex, setDerivativeIndex] = useState<DerivativeIndex>({});
    const [platformSource, setPlatformSource] = useState<null | string>(null);
    const [platformCode, setPlatformCode] = useState<null | string>(null);
    const [_, forceRerender] = useState<any>(null);
    const [saving, setSaving] = useState<boolean>(false);

    useEffect(() => {
        getDerivativeIndex().then(setDerivativeIndex);
    }, []);

    const platformSources = Object.keys(derivativeIndex);
    const getPlatformCodes = useCallback(
        () => platformSource ? Object.keys(derivativeIndex[platformSource]) : [],
        [platformSource]
    );
    const getDerivatives = useCallback(
        () => platformSource && platformCode ? derivativeIndex[platformSource][platformCode] : {},
        [platformSource, platformCode, derivativeIndex]
    );

    const getVisibleDerivatives = () => Object.fromEntries(
        Object.entries(getDerivatives()).filter(([_, value]) => value.visible)
    );

    return (
        <div>
            <div className={styles.selectors}>
                <button
                    className={styles.save_button}
                    disabled={saving}
                    onClick={() => {
                        setSaving(true);
                        putDerivativeIndex(derivativeIndex).then(() => setSaving(false));
                    }}>
                    Save
                </button>
                <Select
                    options={platformSources.map(item => ({value: item, label: item}))}
                    isSearchable
                    onChange={selectedOption => {
                        if (selectedOption) {
                            setPlatformSource(selectedOption.value);
                        }

                        setPlatformCode(null);
                    }}
                />
                <Select
                    options={getPlatformCodes().map(item => ({value: item, label: item}))}
                    value={platformCode && {value: platformCode, label: platformCode}}
                    isSearchable
                    onChange={selectedOption => selectedOption && setPlatformCode(selectedOption.value)}
                />
                <Select
                    className={styles.derivative_selector}
                    options={makeOptions(getDerivatives())}
                    value={makeOptions(getVisibleDerivatives())}
                    isMulti
                    isSearchable
                    onChange={selectedOptions => {
                        Object.values(getDerivatives()).forEach(item => {
                            item.visible = false;
                        });
                        selectedOptions.forEach(item => {
                            item.value.visible = true;
                        });

                        forceRerender({});
                    }}
                />
            </div>
            <div className={styles.loader}>
                <ClimbingBoxLoader loading={saving}/>
            </div>
        </div>
    );
}
