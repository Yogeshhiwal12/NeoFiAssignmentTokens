import React, { useState, useEffect } from "react";
import axios from "axios";
import Select, { components } from "react-select";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import CheckIcon from "@material-ui/icons/Check";

import { motion } from "framer-motion";
import "./App.css";
import Navbar from "./Navbar";

const WEBSOCKET_URL = "wss://stream.binance.com:9443/ws/";
const API_URL = "https://api.binance.com";
const COINGECKO_API_BASE_URL = "https://api.coingecko.com/api/v3";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(4),
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: "16px",
    boxShadow: theme.shadows[4],
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
      borderRadius: "8px",
    },
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "flex-start",
      "& h1, & h2": {
        fontSize: "1rem",
      },
    },
  },
  tokenInfo: {
    display: "flex",
    alignItems: "center",
    marginRight: theme.spacing(2),
    "& img": {
      width: "48px",
      marginRight: theme.spacing(2),
    },
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "flex-start",
      marginRight: 0,
      "& img": {
        width: "24px",
        marginRight: theme.spacing(1),
      },
    },
  },
  select: {
    width: "100%",
    
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      width: "80%",
    },
  },
  input: {
    width: "100%",
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  estimatedAmount: {
    width: "95%",
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    borderRadius: "8px",
    padding: theme.spacing(1),
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "1rem",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1rem",
    },
  },
  button: {
    width: "100%",
    borderRadius:"40px"
  },
 
  logo: {
    position: 'absolute',
    top: '140px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '50px',
    height:"50px",
    borderRadius: '50%',
    backgroundColor: theme.palette.background.paper,
    padding: '2px',
    zIndex: 2,
    [theme.breakpoints.down("sm")]: {
     
      top: 'auto',
      marginTop:"-40px"
    },
  },
  menu: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "21%",
    zIndex: 100,
    overflow: "hidden",
    borderRadius: "16px",
    boxShadow: theme.shadows[4],
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    [theme.breakpoints.down("sm")]: {
      width: "67%",
      height: "auto",
    },
    [theme.breakpoints.between("sm", "md")]: {
      width: "28%",
      height: "auto",
    },
  
    
  },

}));

const App = () => {
  const [selectedToken, setSelectedToken] = useState("");
  const [selectedTokenLogo, setSelectedTokenLogo] = useState("");
  const [tokenData, setTokenData] = useState({});
  const [inrInvestment, setInrInvestment] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [tokenMapping, setTokenMapping] = useState({});
  const classes = useStyles();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v3/ticker/24hr`);
        const usdtSymbols = response.data
          .filter((item) => item.symbol.endsWith("USDT"))
          .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
          .slice(0, 20);
        const tokens = usdtSymbols.map((item) => ({
          value: item.symbol.toLowerCase(),
          label: item.symbol.toUpperCase(),
        }));
        setTokens(tokens);

        const fetchCoinGeckoIDs = async () => {
          try {
            const response = await axios.get('/coingecko/coins/markets', {
              params: {
                vs_currency: 'usd',
                per_page: 100, // You can increase this value to fetch more coins
                page: 1,
                sparkline: false,
              },
            });
        
            const symbols = tokens.map((token) => token.value.slice(0, -4)); // Remove 'usdt' from the token values
        
            const mapping = response.data.reduce((acc, coin) => {
              const ticker = coin.symbol.toLowerCase() + "usdt";
              if (symbols.includes(coin.symbol.toLowerCase())) {
                acc[ticker] = {
                  id: coin.id,
                  logo: coin.image,
                };
              }
              return acc;
            }, {});
            setTokenMapping(mapping);
          } catch (error) {
            console.error("Failed to fetch CoinGecko IDs:", error);
          }
        };
        

        fetchCoinGeckoIDs();
      } catch (error) {
        console.error("Failed to fetch token data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedToken) return;
    const ws = new WebSocket(`${WEBSOCKET_URL}${selectedToken}@trade`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTokenData((prevData) => ({
        ...prevData,
        [data.s.toLowerCase()]: parseFloat(data.p),
      }));
    };
    return () => ws.close();
  }, [selectedToken]);

  useEffect(() => {
    console.log("selectedToken:", selectedToken);
    console.log("tokenMapping:", tokenMapping);
    if (!selectedToken) return;
    const fetchLogo = async () => {
      try {
        const coinData = tokenMapping[selectedToken];
        if (coinData) {
          setSelectedTokenLogo(coinData.logo);
        }
      } catch (error) {
        console.error("Failed to fetch logo:", error);
      }
    };
    fetchLogo();
  }, [selectedToken, tokenMapping]);
  
  
  
  

  const handleTokenChange = (option) => {
    console.log("Selected Token:", option.value);
    setSelectedToken(option.value);
  };
  
  const handleInrInvestmentChange = (event) => {
    setInrInvestment(event.target.value);
  };

  const estimatedTokenAmount = () => {
    const tokenPrice = tokenData[selectedToken] || 0;
    const tokenAmount = (inrInvestment / tokenPrice) * 80;
    return tokenAmount;
  };

  const Option = (props) => {
    const logo = tokenMapping[props.data.value]?.logo;
  
    return (
      <components.Option {...props}>
        {logo && (
          <img
            src={logo}
            alt={`${props.data.label} logo`}
            style={{ width: "24px", marginRight: "8px" }}
          />
        )}
        {props.data.label}
        {props.isSelected && (
          <CheckIcon
            style={{
              marginLeft: "auto",
              color: "#4caf50",
            }}
          />
        )}
      </components.Option>
    );
  };
  
  

  const SingleValue = (props) => {
    const logo = tokenMapping[props.data.value]?.logo;
  
    return (
      <components.SingleValue {...props}>
        {logo && (
          <img
            src={logo}
            alt={`${props.data.label} logo`}
            style={{ width: "24px", marginRight: "8px" }}
          />
        )}
        {props.data.label}
      </components.SingleValue>
    );
  };
  
  const Menu = (props) => {
    const { children, innerProps, selectProps } = props;
    return (
      <components.Menu {...props}>
        <div className={selectProps.classes.menu}>{children}</div>
      </components.Menu>
    );
  };
  

  return (
    <>
    <Navbar />
    <motion.div
    className={`${classes.root} ${classes.logoContainer}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <img
      className={classes.logo}
      src={selectedTokenLogo}
      alt={`${selectedToken.toUpperCase()} logo`}
    />
    
      <div className={classes.header}>
        <Typography variant="h6" component="h1" style={{color
            :"white"}}>
          Current Value:
        </Typography>
        <div className={classes.tokenInfo}>
         
          <Typography variant="h6" component="h2" style={{color
            :"white"}}>
            {tokenData[selectedToken]}
          </Typography>
        </div>
      </div>
      <Select
  className={classes.select}
  options={tokens}
  components={{ Option, SingleValue, Menu }}
  onChange={handleTokenChange}
  placeholder="Select Token"
  classes={classes}
  styles={{
    menu: (provided) => ({
      ...provided,
      
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#4caf50" : provided.backgroundColor,
      color: state.isSelected ? "white" : provided.color,
    }),
  }}
/>
      <TextField
        className={classes.input}
        label="INR investment"
        type="number"
        value={inrInvestment}
        onChange={handleInrInvestmentChange}
        InputProps={{
          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
        }}
        placeholder="INR investment"
        variant="outlined"
      />
      <Typography className={classes.estimatedAmount}>
        {estimatedTokenAmount()} tokens
      </Typography>
      <Button className={classes.button} variant="contained" color="secondary">
        Buy
      </Button>
    </motion.div>
    </>
  );
};

export default App;