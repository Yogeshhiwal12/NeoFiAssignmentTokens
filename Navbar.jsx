import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Hidden from '@material-ui/core/Hidden';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  navLinks: {
    display: 'flex',
    justifyContent: 'start',
    alignItems: 'center',

    [theme.breakpoints.down("sm")]: {
      flexDirection: 'column',
      marginTop: theme.spacing(2), // Add some spacing to the top of the navLinks
    },
    [theme.breakpoints.between("sm", "md")]: {
      flexDirection: 'row',
    },
  },

  navButton: {
    borderRadius: '40px',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
  drawerPaper: {
    width: '50%',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const Navbar = () => {
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box className={classes.navLinks}>
      <AnimatePresence>
        {['Trade', 'Earn', 'Support', 'About'].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Button style={{color:"white"}}>
              <Typography variant="body1">{item}</Typography>
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button className={classes.navButton} variant="contained" color="secondary">
          Connect Wallet
        </Button>
      </motion.div>
    </Box>
  );

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4">NeoFi</Typography>
        </motion.div>
        <Hidden xsDown>
          {drawer}
        </Hidden>
        <Hidden smUp>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
      </Toolbar>
      <Hidden smUp>
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          classes={{
            paper: classes.drawerPaper,
          }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          PaperProps={{
            style: {
              background: `linear-gradient(45deg, ${classes.appBar.background})`,
            },
          }}
        >
          <IconButton
            edge="end"
            color="inherit"
            aria-label="close drawer"
            onClick={handleDrawerToggle}
            style={{ position: 'absolute', left: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
          {drawer}
        </Drawer>
      </Hidden>
    </AppBar>
  );
};

export default Navbar;