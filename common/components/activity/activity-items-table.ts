import {LitElement, html, css, TemplateResult, CSSResultArray, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ActivityItemsTableStyles} from './activity-items-table.styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {GDDActivityItemRow} from './activity-item-row';
import './activity-item-row';
import {AnyObject, GDDActivityItem} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {gddTranslatesMap} from '../../../utils/intervention-labels-map';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {callClickOnSpacePushListener} from '@unicef-polymer/etools-utils/dist/accessibility.util';
import EtoolsDialog from '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import {EtoolsTextarea} from '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';

@customElement('gdd-activity-items-table')
export class GDDActivityItemsTable extends LitElement {
  static get styles(): CSSResultArray {
    // language=css
    return [
      ActivityItemsTableStyles,
      css`
        etools-icon {
          margin: 11px 25px 11px;
          color: var(--secondary-text-color);
          cursor: pointer;
          padding: 0 0 2px 0;
        }
        :host {
          border-bottom: 1px solid var(--main-border-color);
          margin-bottom: 10px;
        }
      `
    ];
  }

  @property() activityItems: Partial<GDDActivityItem>[] = [];
  @property() readonly: boolean | undefined = false;
  @property() dialogElement!: EtoolsDialog;
  @property({type: String})
  currency = '';

  protected render(): TemplateResult {
    // language=html
    return html`
      ${sharedStyles}
      <div class="grid-row header border">
        <div class="grid-cell header-cell left">
          <label required>${translate('ITEM_DESCRIPTION')}</label>
        </div>
        <div class="grid-cell header-cell left">
          <label required>${translate(gddTranslatesMap.unit)}</label>
        </div>
        <div class="grid-cell header-cell end"><label required>${translate(gddTranslatesMap.quantity)}</label></div>
        <div class="grid-cell header-cell end">${translate('PRICE_UNIT')}</div>
        <div class="grid-cell header-cell end">${translate('TOTAL_CASH')} (${this.currency})</div>
        <div class="grid-cell header-cell"></div>
      </div>

      ${this.activityItems.map(
        (item: Partial<GDDActivityItem>, index: number) =>
          html`<gdd-activity-item-row
            .activityItem="${item}"
            @item-changed="${({detail}: CustomEvent) => this.updateActivityItem(index, detail)}"
            @remove-item="${() => {
              this.updateActivityItem(index, null);
            }}"
            .readonly="${this.readonly}"
            .lastItem="${this.isLastItem(index)}"
            .currency="${this.currency}"
          ></gdd-activity-item-row>`
      )}
      ${!this.readonly
        ? html`<etools-icon id="btnAddItem" name="add" tabIndex="0" @click="${() => this.addNew()}"></etools-icon>`
        : html``}
    `;
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
  }

  firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);

    callClickOnSpacePushListener(this.shadowRoot!.querySelector('#btnAddItem'));
  }

  addNew(): void {
    this.activityItems = [
      ...this.activityItems,
      {
        cso_cash: '0',
        unicef_cash: '0',
        name: '',
        unit_price: '0'
      }
    ];
    this.setFocusOnActivityRow();
  }

  setFocusOnActivityRow(focusLastRow = true) {
    setTimeout(() => {
      const activityRows = this.shadowRoot!.querySelectorAll('activity-item-row');
      if (activityRows.length) {
        const rowIndex = focusLastRow ? activityRows.length - 1 : 0;
        const activityNameEl = activityRows[rowIndex].shadowRoot!.querySelector('#activityName') as EtoolsTextarea;
        if (activityNameEl) {
          activityNameEl.focus();
        }
      }
    }, 200);
  }

  updateActivityItem(index: number, item: Partial<GDDActivityItem> | null): void {
    if (item === null) {
      this.activityItems.splice(index, 1);
      this.setFocusOnActivityRow(false);
    } else {
      this.activityItems.splice(index, 1, item);
    }
    fireEvent(this, 'activity-items-changed', [...this.activityItems]);
  }

  validate(): AnyObject | undefined {
    const rows: NodeListOf<GDDActivityItemRow> = this.shadowRoot!.querySelectorAll('activity-item-row');
    let validationData: AnyObject | undefined;
    rows.forEach((row: GDDActivityItemRow) => {
      if (!validationData) {
        const rowValidationData = row.validate();
        if (rowValidationData.invalidRequired || rowValidationData.invalidSum) {
          validationData = Object.assign({}, rowValidationData);
        }
      }
    });
    return validationData;
  }

  isLastItem(currentIndex: number): boolean {
    if (this.activityItems.length == currentIndex + 1) {
      return true;
    }
    return false;
  }
}
