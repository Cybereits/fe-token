import React from 'react';
import { connect } from 'dva';
import styles from './CoinOverView.less';

@connect(({ global }) => ({
  global,
}))
class CoinOverView extends React.Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'global/updateServerState',
    });
  }

  render() {
    const { global: { tokenBalanceOverviewList, serverStateInfoList } } = this.props;
    return (
      <div className={styles.container}>
        <div className={styles.balanceContainer}>
          {tokenBalanceOverviewList.map((item, index) => {
            return (
              /*eslint-disable*/
              <div key={index} className={styles.balanceCell}>
                {item.name} {item.value}
              </div>
            );
          })}
        </div>
        <div className={styles.statusContainer}>
          {
            serverStateInfoList.map(({ uri, currentBlockHeight, gasPrice }) =>
              (
                <div className={styles.infoContainer}>
                  <div>钱包客户端：{uri}</div>
                  <div>当前区块高度：{currentBlockHeight}</div>
                  <div>
                    当前油价：{(+gasPrice).toFixed(10)} ({(Math.round(+gasPrice * (10 ** 11)) / 100).toFixed(2)} GWei)
                  </div>
                </div>
              )
            )
          }
        </div>
      </div>
    );
  }
}

export default CoinOverView;
