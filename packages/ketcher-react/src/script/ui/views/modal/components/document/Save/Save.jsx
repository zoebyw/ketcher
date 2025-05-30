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

import * as structFormat from '../../../../../data/convert/structConverter';

import { Component, createRef } from 'react';
import { createSelector } from 'reselect';
import Form, { Field } from '../../../../../component/form/form/form';
import {
  FormatterFactory,
  KetSerializer,
  formatProperties,
  getPropertiesByFormat,
  getPropertiesByImgFormat,
  b64toBlob,
  KetcherLogger,
  Atom,
  isClipboardAPIAvailable,
  legacyCopy,
} from 'ketcher-core';

import { Dialog } from '../../../../components';
import Tabs from 'src/script/ui/component/view/Tabs';
import { ErrorsContext } from '../../../../../../../contexts';
import { SaveButton } from '../../../../../component/view/savebutton';
import { check } from '../../../../../state/server';
import classes from './Save.module.less';
import { connect } from 'react-redux';
import { saveUserTmpl } from '../../../../../state/templates';
import { updateFormState } from '../../../../../state/modal/form';
import Select from '../../../../../component/form/Select';
import { getSelectOptionsFromSchema } from '../../../../../utils';
import { LoadingCircles } from 'src/script/ui/views/components/Spinner';
import { IconButton } from 'components';

const saveSchema = {
  title: 'Save',
  type: 'object',
  properties: {
    filename: {
      title: 'File name:',
      type: 'string',
      maxLength: 128,
      pattern: '^[^.<>:?"*\\\\|\\/][^<>:?"*\\\\|\\/]*$',
      invalidMessage: (res) => {
        if (!res) return 'Filename should contain at least one character';
        if (res.length > 128) return 'Filename is too long';
        return "A filename cannot contain characters: \\ / : * ? \" < > | and cannot start with '.'";
      },
    },
    format: {
      title: 'File format:',
      enum: Object.keys(formatProperties),
      enumNames: Object.keys(formatProperties).map(
        (format) => formatProperties[format].name,
      ),
    },
  },
};

class SaveDialog extends Component {
  static contextType = ErrorsContext;
  constructor(props) {
    super(props);
    this.state = {
      disableControls: true,
      imageFormat: 'svg',
      tabIndex: 0,
      isLoading: true,
    };
    this.isRxn =
      this.props.struct.hasRxnArrow() || this.props.struct.hasMultitailArrow();
    this.textAreaRef = createRef();

    const formats = !this.props.server
      ? ['ket', this.isRxn ? 'rxn' : 'mol', 'smiles']
      : [
          'ket',
          this.isRxn ? 'rxn' : 'mol',
          this.isRxn ? 'rxnV3000' : 'molV3000',
          'sdf',
          'sdfV3000',
          'rdf',
          'rdfV3000',
          'smarts',
          'smiles',
          'smilesExt',
          'cml',
          '<----firstDivider--->', // for dividers in select list
          'inChI',
          'inChIAuxInfo',
          'inChIKey',
          '<----secondDivider--->', // for dividers in select list
          'svg',
          'png',
          'cdxml',
          'cdx',
          'binaryCdx',
        ];

    this.saveSchema = saveSchema;
    this.saveSchema.properties.format = Object.assign(
      this.saveSchema.properties.format,
      {
        enum: formats,
        enumNames: formats.map((format) => {
          const formatProps =
            getPropertiesByFormat(format) || getPropertiesByImgFormat(format);
          return formatProps?.name;
        }),
      },
    );
  }

  componentDidMount() {
    const { checkOptions } = this.props.checkState;
    this.props.onCheck(checkOptions);
    this.changeType(this.isRxn ? 'rxn' : 'mol').then(
      (res) => res instanceof Error && this.setState({ disableControls: true }),
    );
  }

  isImageFormat = (format) => {
    return !!getPropertiesByImgFormat(format);
  };

  isBinaryCdxFormat = (format) => {
    return format === 'binaryCdx';
  };

  showStructWarningMessage = (format) => {
    const { errors } = this.props.formState;
    return format !== 'mol' && Object.keys(errors).length > 0;
  };

  changeType = (type) => {
    const { struct, server, options, formState, ignoreChiralFlag } = this.props;

    const errorHandler = this.context.errorHandler;
    if (this.isImageFormat(type)) {
      const ketSerialize = new KetSerializer();
      const structStr = ketSerialize.serialize(struct);
      this.setState({
        disableControls: true,
        tabIndex: 0,
        imageFormat: type,
        structStr,
        isLoading: true,
      });
      const serverOptions = { ...options };

      serverOptions.outputFormat = type;

      return server
        .generateImageAsBase64(structStr, serverOptions)
        .then((base64) => {
          this.setState({
            disableControls: false,
            tabIndex: 0,
            imageSrc: base64,
            isLoading: false,
          });
        })
        .catch((e) => {
          KetcherLogger.error('Save.jsx::SaveDialog::changeType', e);
          errorHandler(e);
          this.props.onResetForm(formState);
          return e;
        });
    } else {
      this.setState({ disableControls: true, isLoading: true });
      const factory = new FormatterFactory(server);
      // temporary check if query properties are used
      const queryPropertiesAreUsed =
        type === 'mol' &&
        Array.from(struct.atoms).find(
          ([_, atom]) =>
            atom.queryProperties.aromaticity ||
            atom.queryProperties.connectivity ||
            atom.queryProperties.ringMembership ||
            atom.queryProperties.ringSize ||
            atom.queryProperties.customQuery ||
            atom.implicitHCount,
        );
      const service = factory.create(
        type,
        { ...options, ignoreChiralFlag },
        queryPropertiesAreUsed,
      );
      const getStructFromStringByType = () => {
        if (type === 'ket') {
          const selection = this.props.editor.selection();
          if (selection?.atoms?.length > 0) {
            selection.atoms = selection.atoms.filter((selectedAtomId) => {
              return !Atom.isSuperatomLeavingGroupAtom(struct, selectedAtomId);
            });
          }
          return service.getStructureFromStructAsync(
            struct,
            undefined,
            selection,
          );
        }
        return service.getStructureFromStructAsync(struct);
      };
      return getStructFromStringByType()
        .then(
          (structStr) => {
            this.setState({
              tabIndex: 0,
              structStr,
            });
          },
          (e) => {
            errorHandler(e.message);
            this.props.onResetForm(formState);
            return e;
          },
        )
        .finally(() => {
          this.setState({
            disableControls: false,
            tabIndex: 0,
            isLoading: false,
          });
        });
    }
  };

  changeTab = (index) => {
    this.setState({ tabIndex: index });
  };

  getWarnings = (format) => {
    const { struct, moleculeErrors } = this.props;
    const warnings = [];
    const structWarning =
      'Structure contains errors, please check the data, otherwise you ' +
      'can lose some properties or the whole structure after saving in this format.';
    if (!this.isImageFormat(format)) {
      const saveWarning = structFormat.couldBeSaved(struct, format);
      const isStructInvalid = this.showStructWarningMessage(format);
      if (isStructInvalid) {
        warnings.push(structWarning);
      }
      if (saveWarning) {
        warnings.push(saveWarning);
      }
    }

    if (moleculeErrors) {
      const filteredMoleculeErrors = Object.values(moleculeErrors).filter(
        (error) => {
          if (format === 'smarts' || format === 'ket') {
            return !error.includes('Structure contains query features');
          } else {
            return true;
          }
        },
      );
      warnings.push(...Object.values(filteredMoleculeErrors));
    }
    return warnings;
  };

  renderForm = () => {
    const formState = Object.assign({}, this.props.formState);
    const { filename, format } = formState.result;
    const warnings = this.getWarnings(format);
    const tabs =
      warnings.length === 0
        ? [
            {
              caption: 'Preview',
              component: this.renderSaveFile,
              tabIndex: 0,
            },
          ]
        : [
            {
              caption: 'Preview',
              component: this.renderSaveFile,
              tabIndex: 0,
            },
            {
              caption: 'Warnings',
              component: this.renderWarnings,
              tabIndex: 1,
            },
          ];

    return (
      <div className={classes.formContainer}>
        <Form
          schema={this.saveSchema}
          init={{
            filename,
            format: this.isRxn ? 'rxn' : 'mol',
          }}
          {...formState}
        >
          <Field name="filename" />
          <Field
            name="format"
            onChange={this.changeType}
            options={getSelectOptionsFromSchema(
              this.saveSchema.properties.format,
            )}
            component={Select}
            className="file-format-list"
            data-testid="file-format-list"
          />
        </Form>
        <Tabs
          className={classes.tabs}
          captions={tabs}
          tabIndex={this.state.tabIndex}
          changeTab={this.changeTab}
          tabs={tabs}
        />
      </div>
    );
  };

  handleCopy = (event) => {
    const { structStr } = this.state;

    try {
      if (isClipboardAPIAvailable()) {
        navigator.clipboard.writeText(structStr);
      } else {
        legacyCopy(event.clipboardData, {
          'text/plain': structStr,
        });
        event.preventDefault();
      }
    } catch (e) {
      KetcherLogger.error('copyAs.js::copyAs', e);
      this.props.editor.errorHandler(
        'This feature is not available in your browser',
      );
    }
  };

  renderSaveFile = () => {
    const formState = Object.assign({}, this.props.formState);
    delete formState.moleculeErrors;
    const { format } = formState.result;
    const { structStr, imageSrc, isLoading } = this.state;
    const isCleanStruct = this.props.struct.isBlank();

    const LoadingState = () => (
      <div className={classes.loadingCirclesContainer}>
        <LoadingCircles />
      </div>
    );

    const ImageContent = () => (
      <div className={classes.imageContainer}>
        {!isCleanStruct && (
          <img
            src={`data:image/${format}+xml;base64,${imageSrc}`}
            alt={`${format} preview`}
          />
        )}
      </div>
    );

    const BinaryContent = () => (
      <div className={classes.previewBackground}>
        <textarea
          value="Can not display binary content"
          className={classes.previewArea}
          readOnly
          ref={this.textAreaRef}
          data-testid="preview-area-binary"
        />
      </div>
    );

    const PreviewContent = ({ format }) => {
      return (
        <div className={classes.previewBackground}>
          <textarea
            value={structStr}
            className={classes.previewArea}
            readOnly
            ref={this.textAreaRef}
            data-testid={`${format}-preview-area-text`}
          />
          <IconButton
            onClick={this.handleCopy}
            iconName="copy"
            title="Copy to clipboard"
            testId="copy-to-clipboard"
          />
        </div>
      );
    };

    if (isLoading) {
      return <LoadingState />;
    } else if (this.isImageFormat(format)) {
      return <ImageContent />;
    } else if (this.isBinaryCdxFormat(format)) {
      return <BinaryContent />;
    } else {
      return <PreviewContent format={format} />;
    }
  };

  renderWarnings = () => {
    const formState = Object.assign({}, this.props.formState);
    const { format } = formState.result;
    const warnings = this.getWarnings(format);

    return warnings.length ? (
      <div className={classes.warnings}>
        {warnings.map((warning) => (
          <div className={classes.warningsContainer} key={warning}>
            <span className={classes.warningsArr} data-testid="WarningTextArea">
              {warning}
            </span>
          </div>
        ))}
      </div>
    ) : null;
  };

  getButtons = () => {
    const { disableControls, imageFormat, isLoading, structStr } = this.state;
    const { options, formState } = this.props;
    const { filename, format } = formState.result;
    const isCleanStruct = this.props.struct.isBlank();

    options.outputFormat = imageFormat;

    const savingStruct =
      this.isBinaryCdxFormat(format) && !isLoading
        ? b64toBlob(structStr)
        : structStr;

    const isMoleculeContain =
      this.props.struct.atoms.size && this.props.struct.bonds.size;
    const buttons = [
      <button
        key="save-tmpl"
        className={classes.saveTmpl}
        disabled={disableControls || isCleanStruct || !isMoleculeContain}
        onClick={() => this.props.onTmplSave(this.props.struct)}
      >
        Save to Templates
      </button>,
    ];

    buttons.push(
      <button
        key="cancel"
        mode="onCancel"
        className={classes.cancel}
        onClick={() => this.props.onOk({})}
        type="button"
      >
        Cancel
      </button>,
    );

    if (this.isImageFormat(format)) {
      buttons.push(
        <SaveButton
          mode="saveImage"
          options={options}
          data={structStr}
          filename={filename}
          key="save-image-button"
          type={`image/${format}+xml`}
          onSave={this.props.onOk}
          disabled={
            disableControls ||
            !formState.valid ||
            isCleanStruct ||
            !this.props.server
          }
          className={classes.ok}
        >
          Save
        </SaveButton>,
      );
    } else {
      buttons.push(
        <SaveButton
          mode="saveFile"
          data={savingStruct}
          filename={filename + getPropertiesByFormat(format).extensions[0]}
          key="save-file-button"
          type={format.mime}
          server={this.props.server}
          onSave={this.props.onOk}
          disabled={disableControls || !formState.valid || isCleanStruct}
          className={classes.ok}
        >
          Save
        </SaveButton>,
      );
    }
    return buttons;
  };

  render() {
    return (
      <Dialog
        className={classes.dialog}
        title="Save Structure"
        params={this.props}
        buttons={this.getButtons()}
        needMargin={false}
        withDivider={true}
      >
        {this.renderForm()}
      </Dialog>
    );
  }
}

const getOptions = (state) => state.options;
const serverSettingsSelector = createSelector([getOptions], (options) =>
  options.getServerSettings(),
);

const mapStateToProps = (state) => ({
  server: state.options.app.server ? state.server : null,
  struct: state.editor.struct(),
  options: serverSettingsSelector(state),
  formState: state.modal.form,
  moleculeErrors: state.modal.form.moleculeErrors,
  checkState: state.options.check,
  bondThickness: state.options.settings.bondThickness,
  ignoreChiralFlag: state.editor.render.options.ignoreChiralFlag,
  editor: state.editor,
});

const mapDispatchToProps = (dispatch) => ({
  onCheck: (checkOptions) => dispatch(check(checkOptions)),
  onTmplSave: (struct) => dispatch(saveUserTmpl(struct)),
  onResetForm: (prevState) => dispatch(updateFormState(prevState)),
});

const Save = connect(mapStateToProps, mapDispatchToProps)(SaveDialog);

export default Save;
