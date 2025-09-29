import React, { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { useSelectedGameMode } from "../../../hooks/selected-game-mode.hook";
import { gameModeUrlMap, SET_BOARD_DIMENSIONS } from "../../../store/constants";



export const DifficultyChooser = ({ level, state,children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  

  // Memoized map for level to dimensions
  const levelMap = useMemo(() => ({
    1: 3,
    2: 4,
    3: 5
  }), []);

  const selectedGameMode = useSelectedGameMode();

  // Callback for handling click event
  const handleClick = useCallback(() => {
    const payload = {
      rows: levelMap[level],
      columns: levelMap[level]
    };
    
    dispatch({ type: SET_BOARD_DIMENSIONS, payload });
    navigate(gameModeUrlMap[selectedGameMode],{state:state});
  }, [dispatch, level, levelMap, navigate, selectedGameMode]);

  return <span className="w-full items-center justify-center flex flex-row" onClick={handleClick}>{children}</span>;
};