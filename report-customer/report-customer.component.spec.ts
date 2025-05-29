import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ReportCustomerComponent } from './report-customer.component'

describe('ReportCustomerComponent', () => {
	let component: ReportCustomerComponent
	let fixture: ComponentFixture<ReportCustomerComponent>

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ReportCustomerComponent],
			teardown: { destroyAfterEach: false },
		}).compileComponents()
	}))

	beforeEach(() => {
		fixture = TestBed.createComponent(ReportCustomerComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
