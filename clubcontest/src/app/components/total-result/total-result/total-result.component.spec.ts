/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TotalResultComponent } from './total-result.component';

describe('TotalResultComponent', () => {
  let component: TotalResultComponent;
  let fixture: ComponentFixture<TotalResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TotalResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
