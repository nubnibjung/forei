import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	effect,
	ElementRef,
	inject,
	OnDestroy,
	OnInit,
	signal,
	TemplateRef,
	viewChild,
	ViewChild,
	ViewEncapsulation
} from '@angular/core'
import { DatePipe } from '@angular/common'
import { ReportFilter, Summary_Column, Summary_Lead_Follow_Up } from './../../shared/report.model'
import {
	Go5FieldType,
	Go5TableStandardColumn,
	Go5TableStandardColumnType,
	IGo5TableStandardSortEvent,
	SortOrder
} from '@gofive/design-system-table'
import { Subscription } from 'rxjs'
import { FilterSharingService } from '../../../../core/filter-sharing.service'
import { CustomerService } from '../../../customer/shared/customer.service'
import { ReportService } from '../../shared/report.service'
import { DataSharingService } from '../../../../core/data-sharing.service'
import { CustomerGridRequestModel, CustomerInsight } from '../../../customer/shared/customer.model'
import { CustomerFieldState, CustomerState, Type } from '../../../../shared/enum/customer-types.enum'
import { MasterType } from '../../../../shared/enum/mastertype.enum'
import { Contact, CustomerClassification, CustomerGroup, TopicInterest } from '../../../../shared/models/venio.model'
import { CompanyService } from '../../../admin/shared/company.service'
import { MultiSelectChangeEventArgs, RemoveEventArgs } from '@syncfusion/ej2-dropdowns'
import { MslSidebarComponent } from '../../../shared/msl-sidebar/msl-sidebar.component'
import { TeamService } from '../../../admin/shared/team.service'

import { CommonService } from '../../../../shared/services/common.service'
import { Permissions } from '../../../../shared/enum/permissions.enum'
import { DependenciesInjector } from '@venio/core/dependencies-injector'
import { ServiceResponse } from '@venio/shared/models/service-response'
import { AppConfig } from '@venio/shared/classes/config'
import { ResEvent, ResEventType } from '@venio/shared/enum/event.model'
import { getDate } from '@venio/shared/helper/dateTime'
import { compareArr } from '@venio/shared/helper/arr'
import { AlertDialogService } from '@venio/shared/services/alert.service'
import { LanguageService } from '@venio/shared/services/language.service'
import { DateFormat, PhraseService } from '@gofive/angular-common'
import { autosize } from './../../../../shared/helper/ui'
import { ColumnConfiguration, TemplateColumnConfiguration } from '@gofive/design-system-table'
import { DropdownEventArgs, FilterDataSource } from '@gofive/design-system-dropdown'
import { CustomerDialogService } from '@venio/modules/customer/shared/services/customer-dialog.service'
import { DateRangeModel } from '@gofive/design-system-calendar/lib/models/datepicker.model'
import { AppConfigService } from '@venio/shared/services/app-config.service'
@Component({
	selector: 'app-report-customer',
	templateUrl: './report-customer.component.html',
	styleUrls: ['./report-customer.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ReportCustomerComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('editOwner') editOwner: MslSidebarComponent
	@ViewChild('tableRef') public tableRef
	public filter: CustomerGridRequestModel = new CustomerGridRequestModel()
	public loadingCustomers = false
	public loadingTopic = true
	public indexI = -1
	public customersExport: CustomerInsight[] = []
	public selectedItem: CustomerInsight
	public Reportdata: any[] = []
	public loading = true
	private summaryObserver$: Subscription

	private readonly ownerBody = viewChild<TemplateRef<HTMLTableCellElement>>('ownerBody')
	private readonly customBody = viewChild<TemplateRef<HTMLTableCellElement>>('customBody')
	private readonly interestBody = viewChild<TemplateRef<HTMLTableCellElement>>('interestBody')
	private readonly stateBody = viewChild<TemplateRef<HTMLTableCellElement>>('stateBody')
	private readonly typeBody = viewChild<TemplateRef<HTMLTableCellElement>>('typeBody')
	private readonly sourceBody = viewChild<TemplateRef<HTMLTableCellElement>>('sourceBody')
	private readonly customGroupBody = viewChild<TemplateRef<HTMLTableCellElement>>('customGroupBody')
	private readonly noteBody = viewChild<TemplateRef<HTMLTableCellElement>>('noteBody')
	private readonly dateBody = viewChild<TemplateRef<HTMLTableCellElement>>('dateBody')
	public dataTable: ElementRef
	public columns: Go5TableStandardColumn[] = []
	public hasMoreData = true
	ngAfterViewInit(): void {
		this.columns = [
			{
				id: 'customerName',
				width: '300px',
				minWidth: '300px',
				header: {
					text: 'common_customer_name',
					align: 'start'
				},
				sortable: true,
				type: Go5TableStandardColumnType.Custom,
				bodyTemplate: this.customBody(),
				isActive: true
			},

			{
				id: 'customerState',
				width: '180px',
				minWidth: '180px',
				header: {
					text: 'common_customer_customer_state',
					align: 'start'
				},
				sortable: true,
				type: Go5TableStandardColumnType.Custom,
				bodyTemplate: this.stateBody(),
				isActive: true
			},
			{
				id: 'type',
				width: '180px',
				minWidth: '180px',
				header: {
					text: 'common_customer_customer_type',
					align: 'start'
				},
				sortable: true,
				type: Go5TableStandardColumnType.Custom,
				bodyTemplate: this.typeBody(),
				isActive: true
			},
			{
				id: 'customerInterests.topicName',
				width: '240px',
				minWidth: '240px',
				header: {
					text: 'common_report_interested_in',
					align: 'start'
				},
				sortable: false,
				type: Go5TableStandardColumnType.Custom,
				bodyTemplate: this.interestBody(),
				isActive: true
			},
			{
				id: 'sourceOfLeadName',
				width: '180px',
				minWidth: '180px',
				header: {
					text: 'common_customer_source_of_lead',
					align: 'start'
				},
				type: Go5TableStandardColumnType.Custom,
				bodyTemplate: this.sourceBody(),
				isActive: true
			},
			{
				id: 'customerGroupName',
				width: '180px',
				minWidth: '180px',
				header: {
					text: 'common_customer_group',
					align: 'start'
				},
				type: Go5TableStandardColumnType.Custom,
				bodyTemplate: this.customGroupBody(),
				isActive: true
			},
			{
				id: 'userFullname',
				width: '180px',
				minWidth: '180px',
				header: {
					text: 'common_customer_owner',
					align: 'start'
				},
				type: Go5TableStandardColumnType.Custom,
				bodyTemplate: this.ownerBody(),
				isActive: true
			},
			{
				id: 'note',
				width: '300px',
				minWidth: '300px',
				header: { text: 'common_report_note', align: 'start' },
				sortable: true,
				type: Go5TableStandardColumnType.Custom,
				bodyTemplate: this.noteBody(),
				isActive: true
			},
			{
				id: 'dateAcquired',
				width: '180px',
				minWidth: '180px',
				header: { text: 'common_acquisition_date', align: 'start' },
				sortable: true,
				type: Go5TableStandardColumnType.Text,
				topic: {
					fieldName: 'dateAcquired',
					fieldType: Go5FieldType.Date,
					dateFormat: DateFormat.dateLong
				},
				isActive: true
			}
		]

		if (this.columns?.length > 0 && (!this.Reportdata || this.Reportdata.length === 0) && !this.loading) {
			this.getData()
		}
		const container = document.querySelector('.customer-management-table')

		if (container) {
			this.contentScrollElement = container as HTMLElement
			this.onScroll = this.onScroll.bind(this)
			this.contentScrollElement.addEventListener('scroll', this.onScroll)
		}
	}
	public customerStates = [
		{ value: CustomerState.Lead, text: 'common_customer_lead' },
		{ value: CustomerState.Prospect, text: 'common_customer_prospect' },
		{ value: CustomerState.Customer, text: 'common_customer_customer' }
	]
	public customerTypes = [
		{ value: Type.Business, text: 'common_customer_business' },
		{ value: Type.Individual, text: 'common_customer_individual' }
	]
	public source: MasterType[] = []
	public sourceOfLeadField: Object = { text: 'typeName', value: 'typeId' }
	public field: Object = { text: 'text', value: 'value' }
	public customerGroup: CustomerGroup[] = []
	public customerGroupField: Object = { text: 'customerGroupName', value: 'customerGroupId' }
	public statuses: { [key: string]: Object }[] = [
		{ text: 'common_active', value: 1 },
		{ text: 'common_in_active', value: 0 }
	]
	public classificationFields: Object = { text: 'customerClassificationName', value: 'customerClassificationId' }
	public classifications: CustomerClassification[] = []
	public topicInterestFields: Object = { text: 'topicName', value: 'topicId' }
	public topicInterests: TopicInterest[] = []
	public customerOwnerFields: Object = { text: 'title', value: 'id', picture: 'pictureUrl', detail: 'group' }
	public customerOwners: Object[] = []
	public users = []
	public fieldsCustomerOwner: Object = { text: 'fullname', value: 'userId' }
	public canAssign = false
	public canEdit = false
	private dataSubscription$: Subscription
	private currentFilterSubscription$: Subscription
	private currentDateFilterSubscription$: Subscription
	private eventSubscription: Subscription
	private scrollHeight = 0
	public scrollLoading = signal(false)
	private contentScrollElement: HTMLElement
	public date: Date = new Date()
	public dateRang: DateRangeModel = {
		dateFrom: new Date(this.date.getFullYear(), this.date.getMonth(), 1),
		dateTo: new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0)
	}
	private initializedOwners = false
	public dataSourceFilter: FilterDataSource[] = [
		{
			text: 'common_customer_state',
			value: 'customerTypes',
			allowFiltering: true,
			fields: this.customerStates,
			dataSource: this.customerStates
		},
		{
			text: 'common_customer_source',
			value: 'sourceOfLeads',
			allowFiltering: true,
			fields: this.sourceOfLeadField,
			dataSource: []
		},
		{
			text: 'common_report_interested_in',
			value: 'topicInterests',
			allowFiltering: true,
			fields: this.topicInterestFields,
			dataSource: []
		},
		{
			text: 'common_customer_classification',
			value: 'classifications',
			fields: this.classificationFields,
			allowFiltering: true,
			dataSource: []
		},
		{
			text: 'common_customer_group',
			value: 'groups',
			fields: this.customerGroupField,
			allowFiltering: true,
			dataSource: []
		},
		{
			text: 'common_customer_owner',
			value: 'owners',
			fields: this.customerOwnerFields,
			allowFiltering: true,
			dataSource: []
		},
		{
			text: 'common_status',
			value: 'statuses',
			allowFiltering: true,
			dataSource: this.statuses
		}
	]

	private readonly appConfigService = inject(AppConfigService)

	constructor(
		private filterSharingService: FilterSharingService,
		private customerService: CustomerService,
		public dataShare: DataSharingService,
		public reportsService: ReportService,
		private companyService: CompanyService,
		private teamService: TeamService,
		private datePipe: DatePipe,
		private commonService: CommonService,
		public phraseService: PhraseService,
		private alertService: AlertDialogService,
		public languageService: LanguageService,
		private customerDialogService: CustomerDialogService,
		private _cdr: ChangeDetectorRef
	) {
		this.currentFilterSubscription$ = this.filterSharingService.filterCustomerReport.subscribe((res) => {
			this.filter = res
			if (!this.filter.dateFrom || !this.filter.dateTo) {
				this.filter.dateFrom = getDate(this.dateRang.dateFrom)
				this.filter.dateTo = getDate(this.dateRang.dateTo)
				this.filter.orderBy = 'dateAcquired desc'
			}
			this.scrollHeight = 0
			this.Reportdata = []
			this.getData()
		})
		this.currentDateFilterSubscription$ = this.dataShare.currentSearchReportFilter.subscribe((s) => {
			this.filter.dateFrom = getDate(s.dateFrom)
			this.filter.dateTo = getDate(s.dateTo)
			this.filterSharingService.setFilterCustomerReport(this.filter)
		})
		const currentUser = DependenciesInjector.getCurrentUser()
		if (currentUser) {
			this.canAssign = currentUser.permissions.indexOf(Permissions.Customer_Assign) > -1
			this.canEdit = currentUser.permissions.indexOf(Permissions.Customer_Edit) > -1
		}
		this.eventSubscription = AppConfig.COMMON_EVENT.subscribe((e) => {
			switch (e.event) {
				case 'ContractAddComponent_contact': {
					this.refreshContact(e.data)
				}
			}
		})

		effect(() => {
			if (this.appConfigService.language() && this.initializedOwners) {
				this.getOwner()
			}
		})
	}

	get DateFormat() {
		return DateFormat
	}

	get CurrentAppLanguage() {
		return this.languageService.GetCurrenAppLanguage()
	}

	get autosize() {
		return autosize
	}

	get CustomerFieldState() {
		return CustomerFieldState
	}

	counter(value) {
		return new Array(value)
	}

	ngOnInit() {
		window.addEventListener('scroll', this.onScroll.bind(this))

		this.customerService
			.GetSourceOfLead()
			.toPromise()
			.then((res) => {
				this.source = res.data
				this.setDataSourceFilter('sourceOfLeads', this.source)
			})
		this.customerService
			.GetCustomerGroup()
			.toPromise()
			.then((res) => {
				this.customerGroup = res
				this.setDataSourceFilter('groups', this.customerGroup)
			})
		this.getOwner()
		this.companyService
			.CustomerClassification()
			.toPromise()
			.then((res) => {
				this.classifications = res
				this.setDataSourceFilter('classifications', this.classifications)
			})
		this.customerService
			.GetTopicInterest()
			.toPromise()
			.then((res) => {
				this.topicInterests = res
				this.setDataSourceFilter('topicInterests', this.topicInterests)
			})
		this.customerService
			.GetSourceOfLead()
			.toPromise()
			.then((res) => {
				this.source = res.data
				this.setDataSourceFilter('sourceOfLeads', this.source)
			})
		document.addEventListener('click', (e) => {
			if (!(<HTMLElement>e.target).closest('.highlight')) {
				this.indexI = -1
			}
		})
		this.contentScrollElement = document.querySelector('.dashboard-report-page .content')
		if (this.contentScrollElement) {
			this.onScroll = this.onScroll.bind(this)
			this.contentScrollElement.addEventListener('scroll', this.onScroll)
		}
	}

	ngOnDestroy() {
		window.removeEventListener('scroll', this.onScroll.bind(this))

		this.dataSubscription$?.unsubscribe()
		this.currentFilterSubscription$?.unsubscribe()
		this.currentDateFilterSubscription$?.unsubscribe()
		this.eventSubscription?.unsubscribe()
		if (this.contentScrollElement) {
			this.contentScrollElement.removeEventListener('scroll', this.onScroll)
		}
	}

	public async getData() {
		if (this.loadingCustomers) return
		this.loadingCustomers = true
		this.scrollLoading.set(true)
		this.dataSubscription$?.unsubscribe()
		this.filter.skip = this.Reportdata?.length || 0
		this.filter.pageLength = 20

		this.dataSubscription$ = this.customerService.GetCustomerReport(this.filter).subscribe((res) => {
			const getText = (options: any[], value: any, fields = { text: 'text', value: 'value' }) => {
				const found = options.find((o) => o[fields.value] === value)
				return found ? found[fields.text] : value
			}

			const mappedData = res.data.map((item) => {
				const mapped = {
					...item,
					type: item.type,
					customerName: item.customerName,
					customerId: item.customerId,
					customerCode: item.customerCode,
					customerState: getText(this.customerStates, item.customerInterestIds?.state, {
						text: 'text',
						value: 'value'
					}),
					customerInterests: item.customerInterestIds?.value?.map((i) => i.topicName) || [],
					sourceOfLeadName: getText(this.source, item.sourceOfLead?.value, {
						text: 'typeName',
						value: 'typeId'
					}),
					customerGroupName: getText(this.customerGroup, item.customerGroupId?.value, {
						text: 'customerGroupName',
						value: 'customerGroupId'
					}),
					userFullname: Array.isArray(item.customerOwnersStr?.value)
						? item.customerOwnersStr.value.map((u) => u.pictureUrl)
						: [],
					note: item.notes,
					dateAcquired: item.dateAcquired.value
				}

				return mapped
			})

			this.Reportdata = this.Reportdata.concat(mappedData)

			this.loadingCustomers = false
			this.scrollLoading.set(false)
			this._cdr.detectChanges()
			this.dataSubscription$?.unsubscribe()
			this.dataSubscription$ = null

			AppConfig.OPEN_FN.next({ key: 'dialog', value: { httpStatusCode: res?.httpstatuscode } })
		})
	}

	public getOwner(teamId = 0) {
		this.customerOwners = []
		this.customerService
			.getCustomerOwner(teamId)
			.toPromise()
			.then((res) => {
				this.customerOwners = res.data
				this.setDataSourceFilter('owners', this.customerOwners)
				this.initializedOwners = true
				AppConfig.OPEN_FN.next({ key: 'dialog', value: { httpStatusCode: res?.httpStatusCode } })
			})
	}

	public highlightRow(item, i) {
		this.indexI = this.canEdit ? i : -1
		this.selectedItem = item
	}

	public onSearch(key: string, value) {
		if (key === 'statuses' && value) {
			value = value?.map((s) => s === 1)
		}
		this.filter[key] = value || null
		this.filterSharingService.setFilterCustomerReport(this.filter)
	}

	public onSelectedFilter(event: DropdownEventArgs) {
		const type: string = event?.data?.value
		if (type === 'statuses' && event?.value) {
			event.value = event.value?.map((s) => s === 1)
		}

		this.filterSharingService.setFilterCustomerReport(this.filter)
	}

	public onScroll(e) {
		const scrollPosition = window.pageYOffset + window.innerHeight
		const pageHeight = document.documentElement.scrollHeight
		const isNearBottom = scrollPosition >= pageHeight - 300
		if (!this.loadingCustomers && !this.scrollLoading() && isNearBottom) {
			this.getData()
		}
	}

	exportData() {
		alert('exportData')
	}

	addOwner(item) {
		this.teamService.GetStaff(0, true).subscribe((res) => {
			this.users = res.data

			this.editOwner.setData(res.data)
		})
		if (!item.customerOwnersStr.previousValue) {
			item.customerOwnersStr.orginalValue = item.customerOwnersStr.value
		}
		item.customerOwnersStr.previousValue = item.customerOwnersStr.value?.map((s) => s.userId)
		const userIds = item.customerOwnersStr.value?.map((s) => s.userId)
		this.editOwner.openClick(userIds)
	}

	onSelectOwner(value) {
		this.selectedItem.customerOwnersStr.value = value
		this.saveChange('customerOwnersStr', this.selectedItem)
	}

	onSearchOwner(e) {
		const users = this.users.filter((s) => !e || s.fullname.toLowerCase().search(e) > -1)
		this.editOwner.searchFn(users)
	}

	openEditContact(item, contact: Contact = new Contact()) {
		if (this.canEdit) {
			if (!item.contactIds.previousValue) {
				item.contactIds.orginalValue = item.contactIds.value
			}
			item.contactIds.previousValue = item.contactIds.value?.map((s) => s.contactId)
			let model: ResEvent = {
				type: ResEventType.Create_Contact,
				model: {
					customerId: item.customerId.value,
					contactId: contact.contactId
				}
			}
			AppConfig.OPEN_MODULE.next(model)
		}
	}

	refreshContact(e: Contact) {
		const item = this.selectedItem.contactIds.value.find((s) => s.contactId === e.contactId)
		if (item) {
			item.contactName = e.contactName
		} else {
			this.selectedItem.contactIds.value.push({ contactId: e.contactId, contactName: e.contactName })
		}
	}

	saveChangeDdl(key, item, e) {
		item[key].value = e.value
		if (item[key].value) {
			this.saveChange(key, item)
		}
	}

	removingMsl(key, item, e: RemoveEventArgs) {
		if (item[key].state === CustomerFieldState.ShowAndRequired && item[key].value?.length === 1) {
			e.cancel = true
			return
		}
		item[key].value = item[key].value.filter((s) => s !== e.itemData['topicId'])
	}

	saveChangeMsl(key, item, e: MultiSelectChangeEventArgs) {
		item[key].previousValue = e.oldValue
		item[key].value = e.value
		if (item[key].value) {
			this.saveChange(key, item)
		}
	}

	saveChange(key, item) {
		if (
			(!Array.isArray(item[key].value) && item[key].value !== item[key].orginalValue) ||
			(Array.isArray(item[key].value) && !compareArr(item[key].value, item[key].orginalValue))
		) {
			if (!item[key].value && item[key].state === CustomerFieldState.ShowAndRequired) {
				item[key].value = item[key].orginalValue
				return
			}
			const oldData = {}
			oldData[key] = item[key].previousValue || null
			const newData = {}
			newData[key] = item[key].value || null
			const i = this.columns.findIndex((s) => s.id === item.columns.value)
			this.customerService
				.UpdateCustomerFields(item.customerId.value, oldData, newData)
				.toPromise()
				.then((res) => {
					item = res['data']
					item[key].canChange = false
					this.columns[i] = item
				})
				.catch((e) => {
					item[key].value = item[key].orginalValue
					item[key].canChange = false
					this.columns[i] = item
					if (e.status === 409) {
						const error = e.error as ServiceResponse<any>
						if (error?.hasError) {
							error.errorMessage = error.errorMessage.toLowerCase()
							if (error.errorMessage.indexOf('code') >= 0) {
								this.alertError('common_validation_duplicated_customer_code')
							} else if (error.errorMessage.indexOf('name') >= 0) {
								this.alertError('common_validation_duplicated_customer_name')
							}
							return
						}
					}
					AppConfig.OPEN_FN.next({ key: 'dialog', value: { httpStatusCode: e?.status } })
				})
		}
	}

	setValue(key, item, state = CustomerFieldState.Show) {
		if (!item[key].previousValue) {
			item[key].orginalValue = item[key].value
		}
		item[key].canChange = true
		item[key].previousValue = item[key].value
		item[key].state = !item[key].state ? state : item[key].state
	}

	getArrVal(item, key, primaryKey) {
		return item[key].value?.map((s) => s[primaryKey])
	}

	public alertError(text: string) {
		this.alertService
			.errorDialog({
				title: this.phraseService.translate('common_toast_error'),
				description: this.phraseService.translate(text),
				imageUrl: 'error.png',
				textButtonConfirm: this.phraseService.translate('common_ok')
			})
			.subscribe()
	}

	getSelectedText(options: any[], value: any, fields?: any): string {
		if (!options || !value) return ''

		if (fields) {
			const selected = options.find((opt) => opt[fields.value] === value)
			return selected ? selected[fields.text] : ''
		} else {
			const selected = options.find((opt) => opt.value === value)
			return selected ? selected.text : ''
		}
	}

	openCustomerDetailDialog(event: MouseEvent, customerId: number) {
		event.stopPropagation()
		this.customerDialogService.openCustomerDetailDialog({ customerId })
	}

	private setDataSourceFilter(key: string, data: any[]) {
		const filter = this.dataSourceFilter.find((f) => f.value === key)
		if (filter) {
			filter.dataSource = data
		}
		this.dataSourceFilter = [...this.dataSourceFilter]
	}

	public onClearAll(event) {
		this.dataSourceFilter.forEach((filter) => {
			const key = filter.value
			this.filter[key] = []
		})
		this.getData()
	}

	public setFilter(date: CustomerGridRequestModel) {
		this.filter.dateFrom = new Date(date.dateFrom)
		this.filter.dateTo = new Date(date.dateTo)
		this.filterSharingService.setFilterCustomerReport(this.filter)
	}

	private getSortField(id: string): string {
		const map = {
			customerName: 'customerName',
			customerGroupName: 'customerGroupId',
			sourceOfLeadName: 'sourceOfLeadId',
			customerState: 'customerState',
			customerInterests: 'customerInterestIds',
			userFullname: 'userFullname',
			customerCode: 'customerCode',
			customerId: 'customerId',
			customerType: 'type',
			customerOwner: 'customerOwnersStr',
			dateAcquired: 'dateAcquired',
			note: 'notes'
		}
		return map[id] || id
	}

	sortingBy(event: IGo5TableStandardSortEvent) {
		const sortField = this.getSortField(event.id)
		this.filter.orderBy = `${sortField} ${event.sortOrder}`
		this.filter.ascending = event.sortOrder === SortOrder.Ascending
		this.Reportdata = []
		this.filter.skip = 0
		this.filterSharingService.setFilterCustomerReport(this.filter)
		this.getData()
	}
}
