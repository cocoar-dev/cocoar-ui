import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoarNoteComponent } from './coar-note.component';

describe('CoarNoteComponent', () => {
  let component: CoarNoteComponent;
  let fixture: ComponentFixture<CoarNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarNoteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default color of neutral', () => {
    expect(component.color()).toBe('neutral');
  });

  it('should have default padding of m', () => {
    expect(component.padding()).toBe('m');
  });

  it('should apply color class', () => {
    fixture.componentRef.setInput('color', 'warning');
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains('coar-note--warning')).toBe(true);
  });

  it('should apply padding class', () => {
    fixture.componentRef.setInput('padding', 'l');
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains('coar-note--padding-l')).toBe(true);
  });

  it('should render projected content', () => {
    const testContent = 'Test note content';
    fixture.nativeElement.innerHTML = testContent;
    expect(fixture.nativeElement.textContent).toContain(testContent);
  });
});
