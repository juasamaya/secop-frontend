import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorForenseComponent } from './visor-forense.component';

describe('VisorForenseComponent', () => {
  let component: VisorForenseComponent;
  let fixture: ComponentFixture<VisorForenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisorForenseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisorForenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
