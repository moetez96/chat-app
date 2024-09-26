import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedFriendRequestCardComponent } from './received-friend-request-card.component';

describe('ReceivedFriendRequestComponent', () => {
  let component: ReceivedFriendRequestCardComponent;
  let fixture: ComponentFixture<ReceivedFriendRequestCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReceivedFriendRequestCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivedFriendRequestCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
