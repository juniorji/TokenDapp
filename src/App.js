import './App.css';
import { useState, useCallback, useEffect } from 'react'
import Web3 from 'web3'
import Erc20Abi from './erc20abi.json'

function App() {
  const [isConnectedWeb3, setIsConnectedWeb3] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [balance, setBalance] = useState(0)
  const [web3] = useState(new Web3(Web3.givenProvider || "ws://localhost:8545"))
  const [weiToSend, setWeiToSend] = useState(0)
  const [addressToSend, setAddressToSend] = useState("")
  const [number, setNumber] = useState(0)
  const [numberInput, setNumberInput] = useState(0)
  const [txHash, setTxHash] = useState("")
  const [isMined, setIsMined] = useState(false)
  const [tokenName, setTokenName] = useState("")
  const [tokenBalance, setTokenBalance] = useState(0)
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [tokenAddress, setTokenAddress] = useState("")
  const [receiptAddress, setReceiptAddress] = useState("")
  const [tokenAmount, setTokenAmount] = useState(0)
  const [erc20Contract, setErc20Contract] = useState({})

  const connectToWeb3 = useCallback(
    async () => {
      if(window.ethereum) {
        try {
          await window.ethereum.request({method: 'eth_requestAccounts'})
          setIsConnectedWeb3(true)
        } catch (err) {
          console.error(err)
        }
      } else {
        alert("Install Metamask")
      }
    }
  )

  useEffect(() => {
    const displayAccConnect =  () => alert("connect")
    const displayChainChanged =  () => alert("chainChanged")
    const displayAccChanged =  () => {
    const getAccounts = async () => setAccounts(await web3.eth.getAccounts())
    const acc = getAccounts()
      if(acc.length == 0)
        setIsConnectedWeb3(false)
    }
    const displayNetworkChanged =  () => alert("networkChanged")

    window.ethereum.on('connect', displayAccConnect)
    window.ethereum.on('chainChanged', displayChainChanged)
    window.ethereum.on('accountsChanged', displayAccChanged)
    window.ethereum.on('networkChanged', displayNetworkChanged)

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('connect', displayAccConnect)
        window.ethereum.removeListener('chainChanged', displayAccChanged)
        window.ethereum.removeListener('accountsChanged', displayAccChanged)
        window.ethereum.removeListener('networkChanged', displayNetworkChanged)
      }
    }
  }, [])

  useEffect(() => {
    // Accounts
    const getAccounts = async () => setAccounts(await web3.eth.getAccounts())
    const getBalance = async () => setBalance(await web3.eth.getBalance(accounts[0]))
    if (accounts.length == 0) getAccounts()
    if (accounts.length > 0) getBalance()
    console.log(accounts)
    if(accounts.length == 0)
      setIsConnectedWeb3(false)
  }, [isConnectedWeb3, accounts])
  useEffect(() => {
    if(tokenAddress !== "") {
      const erc20Contract = new web3.eth.Contract(
        Erc20Abi,
        tokenAddress
      )
      const getErc20Info = async () => {
        try {
          const name = await erc20Contract.methods.name().call()
          const balance = await erc20Contract.methods.balanceOf(accounts[0]).call()
          const symbol = await erc20Contract.methods.symbol().call()
          console.log(name+balance+symbol);
          setTokenName(name)
          setTokenBalance(balance)
          setTokenSymbol(symbol)
        } catch (error) {
          alert("The contract address is not valid.")
        }
      }
  
      getErc20Info()
    }
  }, [tokenAddress,accounts])

  function transferToken() {
    const erc20Contract = new web3.eth.Contract(
      Erc20Abi,
      tokenAddress
    )
    const sendErc20 = async () => {
      try {
        console.log(erc20Contract)
        console.log(receiptAddress)
        const receipt = await erc20Contract.methods.transfer(receiptAddress, tokenAmount).send({from: accounts[0]})
      } catch (error) {
        alert("Error send.")
      }
    }
    sendErc20()
  }

  //////////////////////////////////
  return (
    <div >
      <div id="alto" >
            <button  class="sx">
                Kovan
            </button>
            {
              isConnectedWeb3 || accounts[0]
                ? <button >Connected</button>
                : <button onClick={connectToWeb3}>Connect to web3</button>
            }
        </div>
        <div id="basso">
          <h1 >
            Web3 Token
          </h1>
          <h2>Tokens</h2>
          <label>Address ERC20:</label><input type="text" onChange={e => setTokenAddress(e.target.value)} /><br/>
          Nom : {tokenName}<p onChange={e => setTokenName(e.target.value)}/>
          Symbol : {tokenSymbol}<p onChange={e => setTokenSymbol(e.target.value)}/>
          Balance : {tokenBalance}<p onChange={e => setTokenBalance(e.target.value)}/>
          <br/>
          <h3>Transfer</h3>
          <label>Address:</label><input type="text" onChange={e => setReceiptAddress(e.target.value)} />
          <br/>
          <label>Amount:</label><input type="text" onChange={e => setTokenAmount(e.target.value)} />
          <button onClick={transferToken}>Send</button>
        </div>
    </div>
  )
}

export default App;
