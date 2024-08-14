import React, { useEffect, useState } from "react";
import {
  Divider,
  Tooltip,
  List,
  Avatar,
  Spin,
  Tabs,
  Input,
  Button,
} from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import logo from "../noImg.png";
//import axios from "axios";
import { CHAINS_CONFIG } from "../chains";
import { ethers } from "ethers";

//const address = "0x67B0829FBE67903F579a3CC7775b10a7C33A7e66";

//const providerUrl = "https://mainnet.infura.io/v3/626b7233f4b0479cbfeba309abad79ab";
//const provider = new ethers.JsonRpcProvider(providerUrl);
//const provider = new ethers.InfuraProvider(selectedChain, "626b7233f4b0479cbfeba309abad79ab");

function WalletView({
  wallet,
  setWallet,
  seedPhrase,
  setSeedPhrase,
  selectedChain,
}) {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState(null);
  const [nfts, setNfts] = useState(null);
  const [balance, setBalance] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [amountToSend, setAmountToSend] = useState(null);
  const [sendToAddress, setSendToAddress] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [hash, setHash] = useState(null);

  const items = [
    {
      key: "3",
      label: `Tokens`,
      children: (
        <>
          {tokens ? (
            <>
              <List
                bordered
                className="tokenList"
                itemLayout="horizontal"
                dataSource={tokens}
                renderItem={(item, index) => (
                  <List.Item
                    className="tokenName"
                    style={{ textAlign: "left" }}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={item.logo || logo} />}
                      title={item.symbol}
                      description={item.name}
                    />
                    <div className="tokenAmount">
                      {(
                        Number(item.balance) /
                        10 ** Number(item.decimals)
                      ).toFixed(3)}{" "}
                      Tokens
                    </div>
                  </List.Item>
                )}
              />
            </>
          ) : (
            <>
              <span>You seem to not have any tokens yet</span>
            </>
          )}
        </>
      ),
    },
    {
      key: "2",
      label: `NFTs`,
      children: (
        <>
          {nfts ? (
            <>
              {nfts.map((e, i) => {
                return (
                  <>
                    {e && (
                      <img
                        key={i}
                        className="nftImage"
                        alt="nftImage"
                        src={e}
                      />
                    )}
                  </>
                );
              })}
            </>
          ) : (
            <>
              <span>You seem to not have any NFTs yet</span>
            </>
          )}
        </>
      ),
    },
    {
      key: "1",
      label: `Transfer`,
      children: (
        <>
          <h3>Native Balance </h3>
          <h1>
            {balance.toFixed(3)} {CHAINS_CONFIG[selectedChain].ticker}
          </h1>
          <div className="sendRow">
            <p style={{ width: "90px", textAlign: "left" }}> To:</p>
            <Input
              value={sendToAddress}
              onChange={(e) => setSendToAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>
          <div className="sendRow">
            <p style={{ width: "90px", textAlign: "left" }}> Amount:</p>
            <Input
              value={amountToSend}
              onChange={(e) => setAmountToSend(e.target.value)}
              placeholder="Native tokens you wish to send..."
            />
          </div>
          <Button
            style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}
            type="primary"
            onClick={() => sendTransaction(sendToAddress, amountToSend)}
          >
            Send Tokens
          </Button>
          {processing && (
            <>
              <Spin />
              {hash && (
                <Tooltip title={hash}>
                  <p>Hover For Tx Hash</p>
                </Tooltip>
              )}
            </>
          )}
        </>
      ),
    },
  ];

  async function sendTransaction(to, amount) {
    const chain = CHAINS_CONFIG[selectedChain];

    const provider = new ethers.JsonRpcProvider(chain.rpcUrl);

    const privateKey = ethers.Wallet.fromPhrase(seedPhrase).privateKey;

    const wallet = new ethers.Wallet(privateKey, provider);

    const tx = {
      to: to,
      value: ethers.parseEther(amount.toString()),
    };

    setProcessing(true);
    try {
      const transaction = await wallet.sendTransaction(tx);

      setHash(transaction.hash);
      const receipt = await transaction.wait();

      setHash(null);
      setProcessing(false);
      setAmountToSend(null);
      setSendToAddress(null);

      if (receipt.status === 1) {
        getAccountTokens();
      } else {
        console.log("failed");
      }
    } catch (err) {
      setHash(null);
      setProcessing(false);
      setAmountToSend(null);
      setSendToAddress(null);
    }
  }

  /*async function getAccountTokens() {
    setFetching(true);

    const res = await axios.get(`http://localhost:3001/getTokens`, {
      params: {
        userAddress: wallet,
        chain: selectedChain,
      },
    });

    const response = res.data;

    if (response.tokens.length > 0) {
      setTokens(response.tokens);
    }

    if (response.nfts.length > 0) {
      setNfts(response.nfts);
    }

    setBalance(response.balance);

    setFetching(false);
  } */

    
  async function getAccountTokens() {
    setFetching(true);

    try {
      // Obtener el balance del usuario
      const provider = new ethers.InfuraProvider(selectedChain, "626b7233f4b0479cbfeba309abad79ab");
      const balance = await provider.getBalance(wallet);

      // Convertir el balance de wei a ether
      const balanceInEth = ethers.formatEther(balance);
      setBalance(balanceInEth);

      /*// Aquí se necesitaría el contrato de los tokens para poder obtener los tokens del usuario
      // Esto depende del contrato ERC-20 específico del token. Aquí te muestro un ejemplo
      // básico de cómo podrías obtener el balance de un token en particular.

      const tokenAddress = "0x..."; // Dirección del contrato del token
      const tokenABI = [
        // ABI mínima para interactuar con el contrato
        "function balanceOf(address) view returns (uint256)",
      ];

      const tokenContract = new ethers.Contract(
        tokenAddress,
        tokenABI,
        provider
      );
      const tokenBalance = await tokenContract.balanceOf(wallet);
      const formattedTokenBalance = ethers.formatUnits(
        tokenBalance,
        18
      ); // 18 es el número de decimales, puede variar

      // Aquí podrías establecer los tokens obtenidos en el estado
      setTokens([{ tokenAddress, balance: formattedTokenBalance }]);

      // Para NFTs, necesitarías interactuar con contratos ERC-721 o ERC-1155 de manera similar
      // Aquí te doy un ejemplo simple para ERC-721:

      const nftAddress = "0x..."; // Dirección del contrato del NFT
      const nftABI = ["function balanceOf(address) view returns (uint256)"];

      const nftContract = new ethers.Contract(nftAddress, nftABI, provider);
      const nftBalance = await nftContract.balanceOf(wallet);

      if (nftBalance.gt(0)) {
        // Si el usuario tiene NFTs, podrías agregar la lógica para recuperar más detalles
        setNfts([{ nftAddress, balance: nftBalance.toString() }]);
      } */
    } catch (error) {
      console.error("Error fetching tokens or balance:", error);
    } finally {
      setFetching(false);
    }
  }
    

  function logout() {
    setSeedPhrase(null);
    setWallet(null);
    setNfts(null);
    setTokens(null);
    setBalance(0);
    navigate("/");
  }

  useEffect(() => {
    if (!wallet || !selectedChain) return;
    setNfts(null);
    setTokens(null);
    setBalance(0);
    getAccountTokens();
  }, []);

  useEffect(() => {
    if (!wallet) return;
    setNfts(null);
    setTokens(null);
    setBalance(0);
    getAccountTokens();
  }, [selectedChain]);

  return (
    <>
      <div className="content">
        <div className="logoutButton" onClick={logout}>
          <LogoutOutlined />
        </div>
        <div className="walletName">Wallet</div>
        <Tooltip title={wallet}>
          <div className="walletAddress">
            {wallet.slice(0, 4)}...{wallet.slice(38)}
          </div>
        </Tooltip>
        <Divider />
        {fetching ? (
          <Spin />
        ) : (
          <Tabs defaultActiveKey="1" items={items} className="walletView" />
        )}
      </div>
    </>
  );
}

export default WalletView;
