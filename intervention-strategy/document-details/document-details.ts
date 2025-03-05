import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';

import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {selectDocumentDetails, selectDocumentDetailsPermissions} from './documentDetails.selectors';
import {GDDDocumentDetailsPermissions, GDDDocumentDetails} from './documentDetails.models';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {patchIntervention} from '../../common/actions/gddInterventions';
import cloneDeep from 'lodash-es/cloneDeep';
import {RootState} from '../../common/types/store.types';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, Permission} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {gddTranslatesMap} from '../../utils/intervention-labels-map';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/info-icon-tooltip';
import {detailsTextareaRowsCount} from '../../utils/utils';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import '@unicef-polymer/etools-unicef/src/etools-checkbox/etools-checkbox';

/**
 * @customElement
 */
@customElement('gdd-document-details')
export class GDDDocumentDetailsElement extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [layoutStyles];
  }

  render() {
    if (!this.data || !this.permissions) {
      return html` ${sharedStyles}
        <etools-loading source="doc-det" active></etools-loading>`;
    }
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }

        info-icon-tooltip {
          --iit-icon-size: 18px;
          --iit-margin: 0 0 4px 4px;
        }
        .padding-v {
          padding-block-start: 2px;
          padding-block-end: 2px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('DOCUMENT_DETAILS')}
        comment-element="document-details"
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="row">
          <div class="col-12">
            <etools-textarea
              id="title"
              label=${translate('TITLE')}
              always-float-label
              placeholder="—"
              .autoValidate="${this.autoValidate}"
              .value="${this.data.title}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'title')}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit?.title)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit?.title) ? -1 : undefined}"
              ?required="${this.permissions?.required.title}"
              @focus="${() => (this.autoValidate = true)}"
              error-message="This field is required"
              maxlength="256"
              .charCounter="${!this.isReadonly(this.editMode, this.permissions?.edit?.title)}"
            >
            </etools-textarea>
          </div>

          <div class="col-12">
            <div>
              <label class="label">${translate(gddTranslatesMap.implementation_strategy)}</label>
              <info-icon-tooltip
                id="iit-implemen-strat"
                slot="after-label"
                ?hidden="${this.isReadonly(this.editMode, this.permissions?.edit?.implementation_strategy)}"
                .tooltipText="${translate('GDD_STRATEGY_AND_TECHNICAL_GUIDANCE_TOOLTIP')}"
              ></info-icon-tooltip>
            </div>
            <etools-textarea
              id="implementation-strategy"
              no-label-float
              placeholder="—"
              .value="${this.data.implementation_strategy}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'implementation_strategy')}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit?.implementation_strategy)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit?.implementation_strategy)
                ? -1
                : undefined}"
              ?required="${this.permissions?.required.implementation_strategy}"
              maxlength="5000"
              rows="${detailsTextareaRowsCount(this.editMode)}"
              .charCounter="${!this.isReadonly(this.editMode, this.permissions?.edit?.implementation_strategy)}"
            >
            </etools-textarea>
          </div>
        </div>
        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }
  @property({type: Object})
  data!: GDDDocumentDetails;

  @property({type: Object})
  permissions!: Permission<GDDDocumentDetailsPermissions>;

  @property({type: Object})
  originalData = {};

  @property({type: Boolean})
  canEditDocumentDetails!: boolean;

  @property({type: Boolean})
  autoValidate = false;

  stateChanged(state: RootState) {
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'gpd-interventions', 'strategy')) {
      return;
    }

    if (!state.gddInterventions.current) {
      return;
    }
    this.data = selectDocumentDetails(state);
    this.originalData = cloneDeep(this.data);
    this.setPermissions(state);
    super.stateChanged(state);
  }

  private setPermissions(state: any) {
    this.permissions = selectDocumentDetailsPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
  }

  saveData() {
    if (!this.validate()) {
      return Promise.resolve(false);
    }
    return getStore()
      .dispatch<AsyncAction>(patchIntervention(this.data))
      .then(() => {
        this.editMode = false;
      });
  }
}
