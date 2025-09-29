import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const StyledBackButton = styled.button`
  background-color: transparent;
  border: none;
  font-size: 2.2em;
  line-height: 60px;
  cursor: pointer;
  color: white;
  padding: 0 0.5em;
`;

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <StyledBackButton onClick={() => navigate(-1) }>&lt;</StyledBackButton>
  );
};
