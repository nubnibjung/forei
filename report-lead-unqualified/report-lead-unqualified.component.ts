import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core'
import { MasterType, TopicInterest } from '@venio/shared/models/venio.model'

import { AlertDialogService } from '@venio/shared/services/alert.service'
import { CustomerService } from '@venio/modules/customer/shared/customer.service'
import { DataSharingService } from '@venio/core/data-sharing.service'
import { DateFormat } from '@gofive/angular-common'
import { FilterSharingService } from '@venio/core/filter-sharing.service'
import { LanguageService } from '@venio/shared/services/language.service'
import { Permissions } from '@venio/shared/enum/permissions.enum'
import { ReportFilter } from '../../shared/report.model'
import { ReportService } from '../../shared/report.service'
import { StaffFilter } from '../../../admin/shared/team.model'
import { Subscription } from 'rxjs'
import { TeamService } from '@venio/modules/admin/shared/team.service'
import { getDate } from '@venio/shared/helper/dateTime'
import { AppConfig } from '@venio/shared/classes/config'
import { ColumnConfiguration, TemplateColumnConfiguration } from '@gofive/design-system-table'
import { CustomerDialogService } from '@venio/modules/customer/shared/services/customer-dialog.service'
import { conversationActionIdToKey } from '@venio/shared/constansts'
import { DropdownEventArgs, FilterDataSource } from '@gofive/design-system-dropdown/lib/models/dropdown.model'
import { DateRangeModel } from '@gofive/design-system-calendar/lib/models/datepicker.model'
import { Go5DropdownFilterEventArgs } from '@venio/shared/interfaces/dropdown.interface'
import {Go5FieldType, Go5TableStandardColumn, Go5TableStandardColumnType, IGo5TableStandardSortEvent, OptionColumnModel} from '@gofive/design-system-table'
@Component({
	selector: 'app-report-lead-unqualified',
	templateUrl: './report-lead-unqualified.component.html',
	styleUrls: ['./report-lead-unqualified.component.scss']
})
export class ReportLeadUnqualifiedComponent implements OnInit, OnDestroy {
	@ViewChild('tableRef') public tableRef
	public filter: ReportFilter = new ReportFilter()
	public loading = true
	public loadingFilter = true
	public data: Object[] = []
	public source: MasterType[] = []
	public sourceFields = { text: 'typeName', value: 'typeId' }
	public topicInterests: TopicInterest[] = []
	public topicInterestFields = { text: 'topicName', value: 'topicId' }
	public unqualifiedReasons = []
	public unqualifiedFields = { text: 'name', value: 'unqualifiedReasonId' }
	public staffs: Object[] = []
	public stfFields: Object = { text: 'fullName', value: 'userId', picture: 'pictureUrl', detail: 'positionName' }
	public teams: Object[] = []
	public teamFields: Object = { text: 'teamName', value: 'teamId' }
	public columns : Go5TableStandardColumn[] = []
	ngAfterViewInit() : void{
		this.columns = [
			{
				id: 'customerName',
				header: {
					text: 'common_report_customer_name'
				},
				sortable: true,
				width: '20%',
				minWidth: '180px',
				type: Go5TableStandardColumnType.Text,
				topic: {
					fieldName: 'customerName'
				}
			},
			{
				id: 'sourceOfLead',
				header: {
					text: 'common_customer_source_of_lead'
				},
				sortable: true,
				width: '10%',
				type: Go5TableStandardColumnType.Text,
				topic: {
					fieldName: 'sourceOfLead'
				}
			},
			{
				id: 'interestedIn',
				header: {
					text: 'common_report_interested_in'
				},
				sortable: true,
				width: '10%',
				type: Go5TableStandardColumnType.Text,
				topic: {
					fieldName: 'interestedIn'
				}
			},
			{
				id: 'owner',
				header: {
					text: 'common_customer_owner'
				},
				sortable: true,
				width: '10%',
				type: Go5TableStandardColumnType.Text,
				topic: {
					fieldName: 'owner'
				}
			},
			{
				id: 'dateAcquisition',
				header: {
					text: 'common_acquisition_date'
				},
				sortable: true,
				width: '20%',
				minWidth: '180px',
				type: Go5TableStandardColumnType.Text,
				topic: {
					fieldName: 'dateAcquisition',
					fieldType: Go5FieldType.Date
				}
			},
			{
				id: 'dateUnqualified',
				header: {
					text: 'common_unqualified_date'
				},
				sortable: true,
				width: '20%',
				type: Go5TableStandardColumnType.Text,
				topic: {
					fieldName: 'dateUnqualified',
					fieldType: Go5FieldType.Date
				}
			},
			{
				id: 'unqualifiedReason',
				header: {
					text: 'common_unqualified_reasons'
				},
				sortable: true,
				width: '22%',
				type: Go5TableStandardColumnType.Text,
				topic: {
					fieldName: 'unqualifiedReason'
				}
			},
			{
				id: 'remark',
				header: {
					text: 'common_remark'
				},
				sortable: true,
				width: '30%',
            	minWidth: '180px',
				type: Go5TableStandardColumnType.Text,
				topic: {
					fieldName: 'remark'
				}
			},
		]
	}
	// public columns: ColumnConfiguration[] = [
	// 	{
	// 		...new TemplateColumnConfiguration('customerName', null, 'common_report_customer_name'),
	// 		textAlign: 'left',
	// 		width: '20%',
	// 		minWidth: '180px'
	// 	},
	// 	{
	// 		...new TemplateColumnConfiguration('sourceOfLead', null, 'common_customer_source_of_lead'),
	// 		textAlign: 'left',
	// 		width: '10%'
	// 	},
	// 	{
	// 		...new TemplateColumnConfiguration('interestedIn', null, 'common_report_interested_in'),
	// 		textAlign: 'left',
	// 		width: '10%'
	// 	},
	// 	{
	// 		...new TemplateColumnConfiguration('owner', null, 'common_customer_owner'),
	// 		textAlign: 'left',
	// 		width: '10%'
	// 	},
	// 	{
	// 		...new TemplateColumnConfiguration('dateAcquisition', null, 'common_acquisition_date'),
	// 		textAlign: 'left',
	// 		width: '20%',
	// 		minWidth: '180px'
	// 	},
	// 	{
	// 		...new TemplateColumnConfiguration('dateUnqualified', null, 'common_unqualified_date'),
	// 		textAlign: 'left',
	// 		width: '20%'
	// 	},
	// 	{
	// 		...new TemplateColumnConfiguration('unqualifiedReason', null, 'common_unqualified_reasons'),
	// 		textAlign: 'left',
	// 		width: '22%'
	// 	},
	// 	{
	// 		...new TemplateColumnConfiguration('remark', null, 'common_remark'),
	// 		textAlign: 'left',
	// 		width: '30%',
	// 		minWidth: '180px'
	// 	}
	// ]
	public filterSelected: ReportFilter = new ReportFilter()
	private currentFilterSubscription$: Subscription
	private currentDateFilterSubscription$: Subscription
	private dataSubscription$: Subscription
	private scrollHeight = 0
	public staff$ = new Subscription()
	public date: Date = new Date()
	public dateRang: DateRangeModel = {
		dateFrom: new Date(this.date.getFullYear(), this.date.getMonth(), 1),
		dateTo: new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0)
	}
	public dataSourceFilter: FilterDataSource[] = [
		{
			text: 'common_customer_source_of_lead',
			value: 'sourceOfLeadIds',
			allowFiltering: true,
			fields: this.sourceFields,
			dataSource: []
		},
		{
			text: 'common_customer_interestedin',
			value: 'interestedIds',
			allowFiltering: true,
			fields: this.topicInterestFields,
			dataSource: []
		},
		{
			text: 'common_unqualified_reasons',
			value: 'unqualifiedReasonIds',
			allowFiltering: true,
			fields: this.unqualifiedFields,
			dataSource: []
		},
		{
			text: 'common_employee_team',
			value: 'teamIds',
			fields: this.teamFields,
			allowFiltering: true,
			dataSource: []
		},
		{
			text: 'common_customer_owner',
			value: 'staffIds',
			fields: this.stfFields,
			allowFiltering: true,
			dataSource: []
		}
	]

	constructor(
		private filterSharingService: FilterSharingService,
		private customerService: CustomerService,
		private customerDialogService: CustomerDialogService,
		public reportService: ReportService,
		private teamService: TeamService,
		public dataShare: DataSharingService,
		private alertService: AlertDialogService,
		public languageService: LanguageService,
		private cdr: ChangeDetectorRef
	) {
		this.currentFilterSubscription$ = this.filterSharingService.filterLeadUnqualifiedReport.subscribe((res) => {
			this.filter = res
			this.scrollHeight = 0
			this.reloadData()
		})
	}

	get DateFormat() {
		return DateFormat
	}

	get CurrentAppLanguage() {
		return this.languageService.GetCurrenAppLanguage()
	}

	counter(value) {
		return new Array(value)
	}

	ngOnInit(): void {
		this.getSourceOfLead()
		this.getTopicInterest()
		this.getUnqualified()
		this.getTeamsList()
		this.getStaffList()
		this.loadSetting()
	}

	ngOnDestroy() {
		this.dataSubscription$?.unsubscribe()
		this.currentFilterSubscription$?.unsubscribe()
		this.currentDateFilterSubscription$?.unsubscribe()
		this.customerDialogService.closeCustomerDetailDialog()
	}

	loadSetting() {
		this.currentDateFilterSubscription$ = this.dataShare.currentSearchReportFilter.subscribe((s) => {
			this.filter.dateFrom = getDate(s.dateFrom)
			this.filter.dateTo = getDate(s.dateTo)
			this.filter.orderBy = 'dateUnqualified desc'
			this.filterSharingService.setFilterLeadUnqualifiedReport(this.filter)
		})
	}

	public reloadData() {
		this.data = []
		this.getData()
	}

	getData(pageLength = 40) {
		this.loading = true
		this.filter.start = this.data?.length || 0
		this.filter.pageLength = pageLength
		this.dataSubscription$?.unsubscribe()
		this.dataSubscription$ = this.reportService.LeadUnqualifiedReport(this.filter).subscribe(
			(res) => {
				this.data = this.data.concat(res.data.data)
				this.loading = false
				this.loadingFilter = false
				this.dataSubscription$?.unsubscribe()
				this.dataSubscription$?.remove(this.dataSubscription$)
				this.dataSubscription$ = null
				AppConfig.OPEN_FN.next({ key: 'dialog', value: { httpStatusCode: res?.httpStatusCode } })
			},
			(err) => {
				this.data = []
				this.loading = false
			}
		)
	}

	public onScroll(e) {
		const element: HTMLElement = e.target
		if (
			this.scrollHeight < element?.scrollHeight &&
			element?.offsetHeight + element?.scrollTop + 300 > element?.scrollHeight
		) {
			this.scrollHeight = element?.scrollHeight
			this.getData()
		}
	}

	public getSourceOfLead() {
		this.customerService
			.GetSourceOfLead()
			.toPromise()
			.then((res) => {
				this.source = res.data
				this.setDataSourceFilter('sourceOfLeadIds', this.source)
				this.filterSelected.sourceOfLeadIds = []
			})
	}

	public getTopicInterest() {
		this.customerService
			.GetTopicInterest()
			.toPromise()
			.then((res) => {
				this.topicInterests = res
				this.setDataSourceFilter('interestedIds', this.topicInterests)
				this.filterSelected.interestedIds = []
			})
	}

	public getUnqualified() {
		this.customerService
			.GetUnqualifiedReason()
			.toPromise()
			.then((res) => {
				this.unqualifiedReasons = res.data
				this.setDataSourceFilter('unqualifiedReasonIds', this.unqualifiedReasons)
				this.filterSelected.unqualifiedReasonIds = []
				this.cdr.detectChanges()
			})
	}

	public getTeamsList() {
		this.teamService
			.GetDdlTeam()
			.toPromise()
			.then(
				(res) => {
					this.teams = res
					this.setDataSourceFilter('teamIds', this.teams)
					this.filterSelected.teamIds = []
				},
				(err) => {
					this.teams = []
					this.setDataSourceFilter('teamIds', [])
				}
			)
	}

	public onSearch(event = null, key?: string) {
		if (key !== 'search') {
			this.filterSelected[key] = event?.selectedItems || []
			this.filter[key] = event?.value?.length > 0 ? event.value : null
			if (key === 'teamIds') {
				this.getStaffList(this.filter.teamIds)
			}
		}
		this.reloadData()
	}

	// public tedFilter(event = null, key?: string) {
	// 	if (key !== 'search') {
	// 		this.filterSelected[key] = event?.selectedItems || []
	// 		this.filter[key] = event?.value?.length > 0 ? event.value : null
	// 		if (key === 'teamIds') {
	// 			this.getStaffList(this.filter.teamIds)
	// 		}
	// 	}
	// 	this.reloadData()
	// }

	public onSelectedFilter(event: DropdownEventArgs) {
		const type: string = event?.data?.value

		if (type === 'teamIds') {
			this.filter.staffIds = null

			this.getStaffList(this.filter.teamIds?.length ? this.filter.teamIds : [])
		}
		if (event?.selectedItems?.length === 0) {
			this.filterSelected[type] = []
			this.filter[type] = null
		}

		this.filterSharingService.setFilterLeadUnqualifiedReport(this.filter)
	}

	onClearFilter(key?: string) {
		this.filterSelected[key] = []
		this.filter[key] = null
		this.reloadData()
	}

	onClearAll() {
		const dateFrom = new Date(this.filter.dateFrom)
		const dateTo = new Date(this.filter.dateTo)

		this.filter = new ReportFilter()
		this.filter.dateFrom = dateFrom
		this.filter.dateTo = dateTo
		this.filter.orderBy = 'dateUnqualified desc'
		this.filter.interval = 0
		this.filterSharingService.setFilterLeadUnqualifiedReport(this.filter)
		this.reloadData()
	}

	getNameTopic(topicId) {
		return this.topicInterests.find((s) => s.topicId === topicId)?.topicName
	}

	getNameSourceOfLead(id) {
		return this.source.find((s) => s.typeId === id)?.typeName || '-'
	}

	public sorting(event?) {
		this.tableRef.columns.forEach((element) => {
			element.sortBy = 'none'
		})

		let key = event.key
		let type = event.type
		switch (key) {
			case 'customerName':
				this.tableRef.columns[0].sortBy = type

				if (type === 'asc') {
					this.filter.orderBy = 'customerName asc'
				} else if (type === 'desc') {
					this.filter.orderBy = 'customerName DESC'
				}

				break
			case 'sourceOfLead':
				this.tableRef.columns[1].sortBy = type

				if (type === 'asc') {
					this.filter.orderBy = 'sourceOfLead asc'
				} else if (type === 'desc') {
					this.filter.orderBy = 'sourceOfLead DESC'
				}

				break

			case 'interestedIn':
				this.tableRef.columns[2].sortBy = type

				if (type === 'asc') {
					this.filter.orderBy = 'interestedIn asc'
				} else if (type === 'desc') {
					this.filter.orderBy = 'interestedIn DESC'
				}

				break

			case 'owner':
				this.tableRef.columns[3].sortBy = type

				if (type === 'asc') {
					this.filter.orderBy = 'owner asc'
				} else if (type === 'desc') {
					this.filter.orderBy = 'owner DESC'
				}

				break

			case 'dateAcquisition':
				this.tableRef.columns[4].sortBy = type

				if (type === 'asc') {
					this.filter.orderBy = 'dateAcquisition asc'
				} else if (type === 'desc') {
					this.filter.orderBy = 'dateAcquisition DESC'
				}

				break

			case 'dateUnqualified':
				this.tableRef.columns[5].sortBy = type

				if (type === 'asc') {
					this.filter.orderBy = 'dateUnqualified asc'
				} else if (type === 'desc') {
					this.filter.orderBy = 'dateUnqualified DESC'
				}

				break

			case 'unqualifiedReason':
				this.tableRef.columns[6].sortBy = type

				if (type === 'asc') {
					this.filter.orderBy = 'unqualifiedReason asc'
				} else if (type === 'desc') {
					this.filter.orderBy = 'unqualifiedReason DESC'
				}

				break

			case 'remark':
				this.tableRef.columns[7].sortBy = type

				if (type === 'asc') {
					this.filter.orderBy = 'remark asc'
				} else if (type === 'desc') {
					this.filter.orderBy = 'remark DESC'
				}

				break
		}
		this.reloadData()
	}

	private getStaffList(teamIds: number[] = []) {
		if (this.staff$) {
			this.staff$.unsubscribe()
			this.staff$ = null
		}

		const model: StaffFilter = new StaffFilter()

		model.teamIds = teamIds || []
		model.take = 100
		model.skip = 0
		model.type = Permissions.Customer

		model.companyIds = this.filter.companyIds || []
		this.staffs = []
		setTimeout(() => {
			this.staff$ = this.teamService.GetFilterStaff(model).subscribe(
				(res) => {
					this.staffs = res.data
					this.setDataSourceFilter('staffIds', res.data)
					if (this.staff$) {
						this.staff$.unsubscribe()
						this.staff$ = null
					}
				},
				(err) => {
					console.log(err)
					this.setDataSourceFilter('staffIds', null)
					if (err?.status !== 401) {
						AppConfig.OPEN_FN.next({ key: 'dialog', value: { httpStatusCode: err?.status } })
					}
				}
			)
		}, 100)

		this.filterSelected.staffIds = []
	}

	openCustomerDetailDialog(customerId: number) {
		this.customerDialogService.openCustomerDetailDialog({ customerId })
	}

	getConversationActionKey(actionId: number) {
		return actionId in conversationActionIdToKey ? conversationActionIdToKey[actionId] : ''
	}

	private setDataSourceFilter(key: string, data: any[] = null) {
		const filter = this.dataSourceFilter.find((f) => f.value === key)
		if (filter) {
			filter.dataSource = data
		}
		this.dataSourceFilter = [...this.dataSourceFilter]
	}

	public setFilter(date: ReportFilter) {
		this.filter.dateFrom = new Date(date.dateFrom)
		this.filter.dateTo = new Date(date.dateTo)
		this.filter.interval = date.interval
		this.filterSharingService.setFilterLeadUnqualifiedReport(this.filter)
	}

	public onFiltering($event: Go5DropdownFilterEventArgs): void {
		const filterType = $event?.value
		const searchText = $event?.text ?? ''

		if (filterType === 'staffIds') {
			this.teamService
				.GetFilterStaff({
					search: searchText,
					teamIds: this.filter.teamIds,
					skip: 0,
					take: 10000,
					type: Permissions.Customer,
					companyIds: this.filter.companyIds
				})
				.subscribe((res) => {
					this.staffs = res.data

					if ($event.updateData) {
						$event.updateData(res.data)
					}
				})
		}
	}
}
