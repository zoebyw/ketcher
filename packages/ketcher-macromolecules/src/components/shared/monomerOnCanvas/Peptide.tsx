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

export const PeptideAvatar = () => (
  <>
    <symbol id="peptide" viewBox="0 0 70 61" width="70" height="61">
      <path
        className="monomer-body"
        transform="scale(0.5)"
        data-actual-width="35"
        data-actual-height="30.5"
        d="M16.9236 1.00466C17.2801 0.383231 17.9418 6.10888e-07 18.6583 5.98224e-07L51.3417 2.04752e-08C52.0582 7.81036e-09 52.7199 0.383234 53.0764 1.00466L69.4289 29.5047C69.7826 30.1211 69.7826 30.8789 69.4289 31.4953L53.0764 59.9953C52.7199 60.6168 52.0582 61 51.3417 61H18.6583C17.9418 61 17.2801 60.6168 16.9236 59.9953L0.571095 31.4953C0.217407 30.8789 0.217408 30.1211 0.571096 29.5047L16.9236 1.00466Z"
      ></path>
    </symbol>
    <symbol id="peptide-hover" viewBox="0 0 70 61" width="70" height="61">
      <path
        d="M18.2246 1.75116C18.3137 1.59581 18.4792 1.5 18.6583 1.5L51.3417 1.5C51.5208 1.5 51.6863 1.59581 51.7754 1.75116L53.06 1.01408L51.7754 1.75117L68.1279 30.2512C68.2163 30.4053 68.2163 30.5947 68.1279 30.7488L51.7754 59.2488C51.6863 59.4042 51.5208 59.5 51.3417 59.5H18.6583C18.4792 59.5 18.3137 59.4042 18.2246 59.2488L1.87215 30.7488C1.78372 30.5947 1.78372 30.4053 1.87215 30.2512L18.2246 1.75116Z"
        fill="none"
        transform="scale(0.5)"
        stroke="#0097A8"
        strokeWidth="3"
      />{' '}
    </symbol>
    <symbol
      id="modified-background"
      viewBox="0 0 60 20"
      width="30"
      height="20"
      x="2.5"
      y="5"
    >
      <path
        xmlns="http://www.w3.org/2000/svg"
        d="M6.52702 20C5.81057 20 5.14885 19.6168 4.79229 18.9953L0.570974 11.6382C0.217285 11.0218 
           0.217285 10.2639 0.570974 9.64751L5.52999 1.00466C5.88654 0.383235 6.54827 0 7.26472 0H52.735C53.4515
           0 54.1132 0.383234 54.4698 1.00466L59.4288 9.64751C59.7825 10.2639 59.7825 11.0218 59.4288 11.6382
           L55.2075 18.9953C54.8509 19.6168 54.1892 20 53.4727 20H6.52702Z"
        fillOpacity="0.6"
      />
    </symbol>
  </>
);
