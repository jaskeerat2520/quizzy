import { Link } from "react-router-dom";
import React from "react";
import { Drawer, List, ListItem, ListItemText } from "@mui/material";
import { styled } from "@mui/material/styles";

const drawerWidth = 140;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    boxSizing: "border-box",
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    height: "100vh",
    zIndex: 1,
    backgroundColor: "#000", // Force black background
    color: "#fff", // Force white text
  },
}));

function SideBar() {
  const list = () => (
    <List sx={{ color: "#fff", paddingTop: 8 }}>
      {" "}
      {/* Added paddingTop: 8 (adjust as needed) */}
      <ListItem button component={Link} to="/documents">
        <ListItemText
          primary="Documents"
          primaryTypographyProps={{ color: "white" }}
        />
      </ListItem>
      <ListItem button component={Link} to="/dashboard">
        <ListItemText
          primary="Dashboard"
          primaryTypographyProps={{ color: "white" }}
        />
      </ListItem>
      {/* You can add the other list items back here */}
    </List>
  );

  return (
    <StyledDrawer variant="permanent" anchor="left">
      {list()}
    </StyledDrawer>
  );
}

export default SideBar;
