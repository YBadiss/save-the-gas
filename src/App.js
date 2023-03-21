import React, { useState, useEffect } from 'react';
import './App.css';

function GasPrice({ gasPrice }) {
  const tooltipText = gasPrice ? `View on Etherscan Gas Tracker (${gasPrice} Gwei)` : '';

  return (
    <div className="gas-price">
      <p>Current Gas Price:</p>
      {gasPrice && <p className="accent">{gasPrice} Gwei</p>}
      {gasPrice && (
        <a href="https://etherscan.io/gastracker" target="_blank" rel="noopener noreferrer">
          <img src="https://etherscan.io/images/brandassets/etherscan-logo-circle.png" alt="Etherscan Gas Tracker" title={tooltipText} />
        </a>
      )}
    </div>
  );
}

function Box({ calls, gasPrice, ethPrice, gasAmount, hourlySalary }) {
  const formatNumber = (number) => {
    return Math.floor(number).toLocaleString();
  };

  const calculateTotalGasCostInUsd = () => {
    if (!gasPrice || !ethPrice || !gasAmount) return null;

    const gasCostInWei = gasPrice * 10 ** 9;
    const gasCostInEth = gasCostInWei / 10 ** 18;
    const gasCostInUsd = gasCostInEth * ethPrice;
    const totalGasCostInUsd = calls * gasAmount * gasCostInUsd;
    return totalGasCostInUsd;
  };

  const formatGasCost = () => {
    const totalGasCostInUsd = calculateTotalGasCostInUsd();
    if (totalGasCostInUsd === null) return null;
    return (
      <>
        <span className="accent">${formatNumber(totalGasCostInUsd)}</span>
        {' '}saved
      </>
    );
  };
  

  const calculateHoursOfWork = () => {
    const totalGasCostInUsd = calculateTotalGasCostInUsd();
    if (!totalGasCostInUsd || !hourlySalary) return null;
  
    const hoursOfWork = totalGasCostInUsd / hourlySalary;
    return (
      <>
        👍 under{' '}
        <span className="accent">{formatNumber(hoursOfWork)}h</span>
        {' '}of work
      </>
    );
  };
  

  return (
    <div className="box">
      <h2 className="calls-title">For {formatNumber(calls)} calls</h2>
      <h3 className="saved-amount">{formatGasCost()}</h3>
      <h2 className="hours-title">{calculateHoursOfWork()}</h2>
    </div>
  );
}

function HourlySalary({ setHourlySalary }) {
  const [inputValue, setInputValue] = useState(50);

  const handleInputChange = (event) => {
    const value = Math.max(Number(event.target.value), 1);
    setInputValue(value);
    setHourlySalary(value);
  };

  return (
    <form className="hourly-salary-form">
      <label>
        Hourly salary:
        <input type="number" min="1" value={inputValue} onChange={handleInputChange} />
      </label>
    </form>
  );
}

function GasAmount({ setGasAmount }) {
  const [inputValue, setInputValue] = useState(1);

  const handleInputChange = (event) => {
    const value = Math.max(Number(event.target.value), 1);
    setInputValue(value);
    setGasAmount(value);
  };

  return (
    <form>
      <label>
        Amount of Gas saved per call:
        <input type="number" min="1" value={inputValue} onChange={handleInputChange} />
      </label>
    </form>
  );
}

function App() {
  const [gasPrice, setGasPrice] = useState(null);
  const [ethPrice, setEthPrice] = useState(null);
  const [gasAmount, setGasAmount] = useState(1);
  const [hourlySalary, setHourlySalary] = useState(50);

  const fetchGasPrice = async () => {
    try {
      const response = await fetch(
        'https://api.etherscan.io/api?module=gastracker&action=gasoracle'
      );
      const data = await response.json();
      setGasPrice(data.result.FastGasPrice);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEthPrice = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      );
      const data = await response.json();
      setEthPrice(data.ethereum.usd);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEthPrice();
    fetchGasPrice();
  }, []);

  return (
    <div className="App">
      <h1 className="title">Save The Gas</h1>
      <div className="gas-container">
        <GasPrice gasPrice={gasPrice} />
        <GasAmount setGasAmount={setGasAmount} />
        <HourlySalary setHourlySalary={setHourlySalary} />
      </div>
      <div className="box-container">
        <Box calls={100000} gasPrice={gasPrice} ethPrice={ethPrice} gasAmount={gasAmount} hourlySalary={hourlySalary} />
        <Box calls={5000000} gasPrice={gasPrice} ethPrice={ethPrice} gasAmount={gasAmount} hourlySalary={hourlySalary} />
        <Box calls={100000000} gasPrice={gasPrice} ethPrice={ethPrice} gasAmount={gasAmount} hourlySalary={hourlySalary} />
      </div>
      <p className="coingecko-ref">
      Market data provided by <a href="https://www.coingecko.com/" target="_blank" rel="noopener noreferrer">CoinGecko</a>
      </p>
    </div>
  );
}

export default App;
