import {LitElement, html} from 'lit';
import {property, customElement, query} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';

import '@unicef-polymer/etools-unicef/src/etools-table/etools-table';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {
  EtoolsTableColumn,
  EtoolsTableColumnType,
  EtoolsTableChildRow
} from '@unicef-polymer/etools-unicef/src/etools-table/etools-table';
import './supply-agreement-dialog';
import {RootState} from '../../common/types/store.types';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {selectSupplyAgreement, selectSupplyAgreementPermissions} from './supplyAgreement.selectors';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {gddEndpoints} from '../../utils/intervention-endpoints';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {formatServerErrorAsText} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {getIntervention, updateCurrentIntervention} from '../../common/actions/gddInterventions';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import {addCurrencyAmountDelimiter, displayCurrencyAmount} from '@unicef-polymer/etools-unicef/src/utils/currency';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {isUnicefUser} from '../../common/selectors';
import {EtoolsUpload} from '@unicef-polymer/etools-unicef/src/etools-upload';
import {AnyObject, AsyncAction, EtoolsEndpoint, InterventionSupplyItem} from '@unicef-polymer/etools-types';
import {GDD, GDDExpectedResult} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {gddTranslatesMap} from '../../utils/intervention-labels-map';
import {GDD_TABS} from '../../common/constants';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';

const customStyles = html`
  <style>
    .col_3 {
      max-width: 25%;
      width: 25%;
      word-break: break-word;
    }
    .col_2 {
      max-width: 18%;
      width: 18%;
      word-break: break-word;
    }
    .row-actions {
      min-width: 94px !important;
    }
    @media (min-width: 760px) and (max-width: 1080px) {
      .row-actions .actions {
        left: 0;
      }
      table td,
      table th {
        padding: 0.5rem !important;
      }
    }
  </style>
`;

@customElement('gdd-supply-agreements')
export class GDDFollowUpPage extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    if (!this.supply_items) {
      return html` ${sharedStyles}
        <etools-loading source="supply-a" active></etools-loading>`;
    }
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
          --etools-table-col-font-size: var(--etools-font-size-16, 16px);
        }
        .headerLabel {
          padding-inline-end: 4px;
        }
        #uploadHelpPanel {
          margin-block-end: 0;
        }
        div[slot='panel-btns'] {
          display: flex;
          align-items: center;
        }
        .afterTitle {
          padding-block-start: 4px;
        }
        .h-padding {
          padding-inline-start: 24px;
          padding-inline-end: 24px;
        }
        etools-icon-button[name='file-upload'] {
          color: var(--primary-text-color);
        }
        #iit-ger {
          --iit-margin: 8px 0 8px -15px;
          --iit-icon-size: 24px;
        }
        etools-content-panel::part(ecp-header) {
          --ecp-header-height: auto;
        }
        etools-table {
          padding-top: 0 !important;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate(gddTranslatesMap.supply_items)}
        comment-element="supply-agreement"
      >
        ${this.supply_items?.length && this.permissions.edit.supply_items
          ? html` <div slot="after-title">
              <info-icon-tooltip id="iit-ger" .tooltipText="${this.getUploadHelpText()}"></info-icon-tooltip>
            </div>`
          : ``}
        <div slot="panel-btns">
          <span class="mr-20">
            <label class="label font-bold pad-right">${translate('TOTAL_SUPPLY_BUDGET')} </label>
            <label class="font-bold-12"
              >${this.intervention.planned_budget.currency}
              ${displayCurrencyAmount(this.intervention.planned_budget.total_supply!, '0.00')}</label
            >
          </span>
        </div>
        <div slot="panel-btns">
          <etools-info-tooltip
            custom-icon
            position="left"
            ?hide-tooltip="${!this.permissions.edit.supply_items || this.uploadInProcess}"
          >
            <etools-icon-button
              slot="custom-icon"
              ?hidden="${!this.permissions.edit.supply_items || this.uploadInProcess}"
              @click="${() => this.uploader?._openFileChooser()}"
              name="file-upload"
            >
            </etools-icon-button>
            <span slot="message">${translate('UPLOAD_SUPPLY_TOOLTIP')}</span>
          </etools-info-tooltip>

          <etools-loading ?active="${this.uploadInProcess}" no-overlay loading-text></etools-loading>
          <etools-icon-button
            ?hidden="${!this.permissions.edit.supply_items}"
            @click="${() => this.addSupplyItem()}"
            name="add-box"
          >
          </etools-icon-button>
        </div>
        <div class="row" ?hidden="${!this.permissions.edit.supply_items || this.supply_items?.length}">
          <div class="col-12">${this.getUploadHelpElement()}</div>
        </div>

        <etools-table
          ?hidden="${!this.supply_items?.length}"
          .columns="${this.columns}"
          .items="${this.supply_items}"
          @edit-item="${this.editSupplyItem}"
          @delete-item="${this.confirmDeleteSupplyItem}"
          .getChildRowTemplateMethod="${this.getChildRowTemplate.bind(this)}"
          .extraCSS="${this.getTableStyle()}"
          .customData="${{supplyItemProviders: this.supplyItemProviders}}"
          .showEdit=${this.permissions.edit.supply_items}
          .showDelete=${this.permissions.edit.supply_items}
        ></etools-table>
        <div class="row" ?hidden="${this.supply_items?.length}">
          <div class="col-12">
            <p class="h-padding">${translate('NO_SUPPLY_CONTRIBUTION')}</p>
          </div>
        </div>
      </etools-content-panel>

      <etools-upload
        hidden
        accept=".csv"
        .endpointInfo="${{
          endpoint: getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.supplyItemsUpload, {
            interventionId: this.intervention.id
          }).url,
          rawFilePropertyName: 'supply_items_file',
          rejectWithRequest: true
        }}"
        @upload-finished="${(event: CustomEvent) => this.onUploadFinished(event.detail)}"
        @upload-started="${() => (this.uploadInProcess = true)}"
      ></etools-upload>
    `;
  }

  @property({type: Array})
  supply_items!: AnyObject[];

  @property({type: Object})
  intervention!: GDD;

  @property({type: Array})
  columns: EtoolsTableColumn[] = [
    {
      label: translate('ITEM_GDD_CURRENCY') as unknown as string,
      name: 'title',
      type: EtoolsTableColumnType.Text,
      cssClass: 'col_3'
    },
    {
      label: translate('NUMBER_UNITS') as unknown as string,
      name: 'unit_number',
      type: EtoolsTableColumnType.Number,
      cssClass: 'col_2'
    },
    {
      label: translate('PRICE_UNIT') as unknown as string,
      name: 'unit_price',
      type: EtoolsTableColumnType.Number,
      cssClass: 'col_2'
    },
    {
      label: '',
      name: 'total_price',
      cssClass: 'col_2',
      type: EtoolsTableColumnType.Number
    },
    {
      label: translate('PROVIDED_BY') as unknown as string,
      name: 'provided_by',
      cssClass: 'col_2',
      type: EtoolsTableColumnType.Custom,
      capitalize: true,
      customMethod: (item: any, _key: string, customData: AnyObject) => {
        return customData.supplyItemProviders[item.provided_by] || '—';
      }
    }
  ];

  @property({type: Object})
  permissions!: {edit: {supply_items?: boolean}};

  @property({type: Boolean})
  isUnicefUser = false;

  @property()
  uploadInProcess = false;

  @query('etools-upload')
  uploader!: EtoolsUpload & {_openFileChooser(): void};

  @property({type: Object})
  supplyItemProviders: AnyObject = {
    unicef: getTranslation('UNICEF'),
    partner: getTranslation('PARTNER')
  };

  getChildRowTemplate(item: any): EtoolsTableChildRow {
    const childRow = {} as EtoolsTableChildRow;
    childRow.showExpanded = false;
    const resultLink = this.intervention.result_links.find((result: GDDExpectedResult) => result.id === item.result);
    const output = resultLink ? resultLink.cp_output_name : '';
    // hide CP Output for Partner User, and preserve layout
    childRow.rowHTML = html`
      <td></td>
      ${this.isUnicefUser
        ? html`<td class="ptb-0 word-break">
            <div class="child-row-inner-container">
              <label class="label">${translate('CP_OUTPUTS')}</label><br />
              <label>${output || '—'}</label><br />
            </div>
          </td>`
        : html``}
      <td colspan="${this.isUnicefUser ? '3' : '4'}" class="ptb-0 word-break">
        <div class="child-row-inner-container">
          <label class="label">${translate('OTHER_MENTIONS')}</label><br />
          <label>${item.other_mentions || '—'}</label>
        </div>
      </td>
      <td colspan="2" class="ptb-0 word-break">
        <div class="child-row-inner-container" ?hidden="${item.provided_by.toLowerCase() === 'partner'}">
          <label class="label"> ${translate('UNICEF_PRODUCT_NUMBER')}</label><br />
          <label>${item.unicef_product_number || '—'}</label>
        </div>
      </td>
    `;
    return childRow;
  }

  getTableStyle() {
    return html`<style>
        ${sharedStyles}
      </style>
      ${customStyles}`;
  }

  getUploadHelpText() {
    const link1 = 'https://supply.unicef.org/all-materials.html';
    const link2 = 'https://unpartnerportalcso.zendesk.com/hc/en-us/articles/12669187044631-Creating-a-supply-plan';
    return getTranslation('GDD_UPLOAD_SUPPLY_HELPER')
      .replace('{0}', `<a target='_blank' href=${link1}>${link1}</a>`)
      .replace('{1}', `<a target='_blank' href=${link2}>${getTranslation('GUIDE')}</a>`);
  }
  getUploadHelpElement() {
    const paragraph = document.createElement('p');
    paragraph.classList.add('h-padding');
    paragraph.innerHTML = this.getUploadHelpText();
    return paragraph;
  }

  stateChanged(state: RootState): void {
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'gpd-interventions', GDD_TABS.Workplan)) {
      return;
    }
    if (get(state, 'gddInterventions.current')) {
      const currentIntervention = get(state, 'gddInterventions.current');
      this.intervention = cloneDeep(currentIntervention) as GDD;
      this.currencyDisplayForTotal();
    }
    this.supply_items = selectSupplyAgreement(state);
    this.permissions = selectSupplyAgreementPermissions(state);
    this.supply_items.map((item: AnyObject) => {
      item.total_price = addCurrencyAmountDelimiter(item.total_price);
      item.unit_number = Number(item.unit_number);
      item.unit_price = addCurrencyAmountDelimiter(item.unit_price);
      return item;
    });

    if (state.user && state.user.data) {
      this.isUnicefUser = isUnicefUser(state);
    }
    super.stateChanged(state);
  }
  currencyDisplayForTotal() {
    this.columns[3].label = getTranslation('TOTAL_PRICE') + ' (' + this.intervention?.planned_budget?.currency + ')';
  }

  cancelSupply() {
    this.editMode = false;
  }

  editSupplyItem(e: CustomEvent) {
    this.openSupplyDialog(e.detail);
  }

  addSupplyItem() {
    this.openSupplyDialog(new InterventionSupplyItem());
    this.openContentPanel();
  }

  async confirmDeleteSupplyItem(e: CustomEvent) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: translate('DELETE_SUPPLY_PROMPT'),
        confirmBtnText: translate('GENERAL.DELETE')
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      this.deleteSupplyItem(e.detail.id);
    }
  }

  deleteSupplyItem(supplyId: number) {
    const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.supplyAgreementEdit, {
      interventionId: this.intervention.id,
      supplyId: supplyId
    });

    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'gdd-intervention-tabs'
    });

    sendRequest({
      endpoint: endpoint,
      method: 'DELETE'
    })
      .then(() => {
        getStore()
          .dispatch<AsyncAction>(getIntervention())
          .finally(() =>
            fireEvent(this, 'global-loading', {
              active: false,
              loadingSource: 'gdd-intervention-tabs'
            })
          );
      })
      .catch((err: any) => {
        fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'gdd-intervention-tabs'
        });
      });
  }

  onUploadFinished({success, error}: any) {
    this.uploadInProcess = false;
    if (success) {
      getStore().dispatch(updateCurrentIntervention(success));
      fireEvent(this, 'toast', {
        text: getTranslation('SUPPLIES_UPLOADED')
      });
    } else {
      const message = this.getUploadError(error);
      fireEvent(this, 'toast', {text: `${getTranslation('CAN_NOT_UPLOAD_SUPPLIES')}: ${message}`});
    }
  }

  getUploadError(error: any): string {
    const defaultMessage: string = error?.error?.message || 'Unknown error';
    const errorResponse: string = error?.request?.xhr?.responseText || '';
    try {
      const response: AnyObject = JSON.parse(errorResponse);
      return Object.values(response).join('; ');
    } catch {
      return defaultMessage;
    }
  }

  private openSupplyDialog(item: InterventionSupplyItem) {
    openDialog({
      dialog: 'gdd-supply-agreement-dialog',
      dialogData: {
        data: cloneDeep(item),
        interventionId: this.intervention.id,
        result_links: this.intervention.result_links,
        isUnicefUser: this.isUnicefUser,
        currency: this.intervention.planned_budget.currency
      }
    });
  }
}
