/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import styled from '@emotion/styled';
import { Collapse } from '@mui/material';
import { Icon } from 'ketcher-react';

import { IStyledDropdownIconProps, OptionsContainerProps } from './types';

export const StyledDropdownIcon = styled(Icon, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<IStyledDropdownIconProps>`
  position: absolute;
  height: 7px;
  width: 7px;
  right: 3px;
  bottom: 3px;
  cursor: pointer;

  path {
    fill: ${({ isActive }) => (isActive ? 'white' : undefined)};
  }
`;

export const RootContainer = styled.div`
  display: flex;
  position: relative;
  align-items: center;

  &:active {
    .dropdown {
      fill: white;
    }
  }
`;

export const OptionsContainer = styled.div<OptionsContainerProps>`
  display: flex;
  position: absolute;
  left: ${({ isVertical }) => (isVertical ? '-34px' : '5px')};
  top: ${({ isVertical, islayoutModeButton }) =>
    isVertical && islayoutModeButton ? '24px' : isVertical ? '38px' : '0px'};
  border-radius: 4px;
  flex-direction: ${({ isVertical }) => (isVertical ? 'column' : 'row')};
  z-index: 1;
  background-color: white;
  padding: 2px;
`;

export const OptionsItemsCollapse = styled(Collapse)`
  position: relative;
`;

export const VisibleItem = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  width: 32px;
  height: 32px;
  padding: 0;
  justify-content: center;
  border-radius: 2px;
`;
