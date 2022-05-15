import classnames from 'classnames';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import SVG from 'react-inlinesvg';

import { Empty } from '../Empty';
import { ListView, Props as ListViewProps } from '../ListView';
import Loading from '../Loading';
import Pagination from '../Pagination';

import loadingSVG from './loading.svg';
import style from './style.module.less';

export type Params = {
    pageNum: number;
    pageSize: number;
};
export interface RequestReturnType {
    end: boolean;
    total?: number;
    list?: any[];
}

export type Props = Pick<
    ListViewProps,
    'onEndReachedThreshold' | 'itemRender' | 'scrollRef'
> & {
    request: (params: Params) => Promise<RequestReturnType>;
    actionRef?: React.MutableRefObject<
        { reload: () => void; getAllData?: () => any[] | undefined } | undefined
    >;
    pageSize?: number;
    className?: string;
    pagination?: boolean;
};

export default function BtListView({
    className,
    pageSize,
    request,
    actionRef,
    onEndReachedThreshold,
    itemRender,
    scrollRef,
    pagination = true,
}: Props) {
    const requestRef = useRef<() => void>();
    const [total, setTotal] = useState(0);
    const [listData, setListData] = useState<any[]>([]);
    const ListDataRef = useRef<any[]>();
    const mountedRef = useRef(false);

    const [pageParams, setPageParams] = useState({
        pageNum: -1,
        pageSize: pageSize || 10,
    } as Params);
    const [end, setEnd] = useState(false);
    const [loading, setLoading] = useState(true);
    const [init, setInit] = useState(false);

    useEffect(() => {
        ListDataRef.current = listData;
    }, [listData]);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useImperativeHandle(
        actionRef,
        () => ({
            reload: () => {
                setEnd(false);
                setLoading(false);
                if (!pagination) {
                    setListData([]);
                }
                setPageParams({ pageNum: 1, pageSize: pageSize || 10 });
            },
            getAllData: () => {
                return ListDataRef.current;
            },
        }),
        [pageSize, pagination],
    );

    useImperativeHandle(
        requestRef,
        () => () => {
            if (pageParams.pageNum === -1) {
                return;
            }
            if (loading) {
                return;
            }
            setLoading(true);
            request(pageParams)
                .then(({ list, total, end }) => {
                    if (mountedRef.current) {
                        return;
                    }
                    setLoading(false);
                    if (end || !list) {
                        setEnd(true);
                    }
                    if (pagination) {
                        setTotal(total as number);
                        setListData([...(list || [])]);
                    } else {
                        setListData([...listData, ...(list || [])]);
                    }
                })
                .catch((err) => {
                    console.error('BtList request error', err);
                    setLoading(false);
                    setEnd(true);
                })
                .finally(() => setInit(true));
        },
        [request, loading, pagination, pageParams, listData],
    );

    useEffect(() => {
        requestRef.current?.();
    }, [pageParams]);

    return (
        <div
            className={classnames({
                [style.btListViewWrap]: true,
                [className as string]: Boolean(className),
            })}
        >
            <ListView
                loading={loading}
                className={style.btListView}
                end={end}
                dataSource={listData}
                disableEndReached={pagination}
                scrollRef={scrollRef}
                onEndReachedThreshold={onEndReachedThreshold || 10}
                onEndReached={() => {
                    if (!pagination) {
                        setPageParams({
                            ...pageParams,
                            pageNum: pageParams.pageNum + 1,
                        });
                    }
                }}
                emptyRender={() => {
                    return init ? (
                        <Empty className="mining-empty" />
                    ) : (
                        <Loading />
                    );
                }}
                footerRender={() => {
                    if (pagination || !init) {
                        return null;
                    }
                    if (loading) {
                        return (
                            <div className="loading">
                                {<SVG src={loadingSVG} />}
                            </div>
                        );
                    } else if (end && listData?.length) {
                        // return <div className="end">{langInfo.endTip}</div>;
                    }
                    return null;
                }}
                itemRender={itemRender}
            />
            {pagination && listData.length ? (
                <Pagination
                    total={total}
                    current={pageParams.pageNum}
                    onChange={(index) => {
                        setPageParams({ ...pageParams, pageNum: index });
                    }}
                />
            ) : null}
        </div>
    );
}
