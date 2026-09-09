import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GetHelp } from './get-help';

describe('GetHelp', () => {
  let component: GetHelp;
  let fixture: ComponentFixture<GetHelp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetHelp],
    }).compileComponents();

    fixture = TestBed.createComponent(GetHelp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
