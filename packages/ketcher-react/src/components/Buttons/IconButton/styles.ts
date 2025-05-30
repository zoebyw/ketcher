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
import Icon from '../../Icon/Icon';
import { style } from 'src/components/styles';
import { IStyledButtonProps } from './types';
import { css } from '@emotion/react';

export const StyledButton = styled('button', {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<IStyledButtonProps>((props) => ({
  boxShadow: 'none',
  transition: 'none',
  background: 'none',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  border: '0',
  borderRadius: style.border.radius.regular,
  padding: '2px',
  minHeight: '28px',
  minWidth: '28px',
  cursor: 'pointer',
  color: props.isActive ? style.text.color.secondary : style.text.color.primary,
  backgroundColor: props.isActive
    ? style.background.color.secondary
    : undefined,

  ':hover': {
    color: props.isActive ? undefined : style.text.color.hover,
    backgroundColor: props.isActive ? style.background.color.hover : undefined,
  },

  ':active': {
    color: style.text.color.secondary,
    backgroundColor: style.background.color.secondary,
  },

  ':disabled': {
    opacity: '0.4',
    cursor: 'not-allowed',
  },
}));

const IconStyles = css`
  width: 100%;
  height: 100%;
`;

export const StyledIcon = styled(Icon)`
  ${IconStyles};
`;

export const StyledCustomIcon = styled('img')`
  ${IconStyles};
`;
