import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoarAvatarComponent, AvatarSize } from './coar-avatar.component';

describe('CoarAvatarComponent', () => {
  let component: CoarAvatarComponent;
  let fixture: ComponentFixture<CoarAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarAvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('defaults', () => {
    it('should have m size by default', () => {
      expect(component.size()).toBe('m');
    });

    it('should have circle shape by default', () => {
      expect(component.shape()).toBe('circle');
    });

    it('should have empty name by default', () => {
      expect(component.name()).toBe('');
    });

    it('should have empty src by default', () => {
      expect(component.src()).toBe('');
    });
  });

  describe('sizes', () => {
    it.each(['xs', 's', 'm', 'l', 'xl', 'xxl'] as AvatarSize[])(
      'should apply %s size class to host',
      (size) => {
        fixture.componentRef.setInput('size', size);
        fixture.detectChanges();
        // Classes are on the host element
        expect(fixture.nativeElement.classList).toContain(`coar-avatar--${size}`);
      }
    );
  });

  describe('shapes', () => {
    it('should apply square shape class to host', () => {
      fixture.componentRef.setInput('shape', 'square');
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-avatar--square');
    });

    it('should not have square class for circle shape', () => {
      fixture.componentRef.setInput('shape', 'circle');
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).not.toContain('coar-avatar--square');
    });
  });

  describe('image display', () => {
    it('should display image when src is provided', () => {
      fixture.componentRef.setInput('src', 'https://example.com/avatar.jpg');
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('.coar-avatar__image');
      expect(img).toBeTruthy();
      expect(img.src).toBe('https://example.com/avatar.jpg');
    });

    it('should use name for alt text', () => {
      fixture.componentRef.setInput('src', 'https://example.com/avatar.jpg');
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('.coar-avatar__image');
      expect(img.alt).toBe('John Doe');
    });
  });

  describe('initials fallback', () => {
    it('should display first 3 characters when no src is provided', () => {
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.detectChanges();

      const initials = fixture.nativeElement.querySelector('.coar-avatar__initials');
      expect(initials).toBeTruthy();
      expect(initials.textContent.trim()).toBe('JOH');
    });

    it('should use first 3 characters of name', () => {
      fixture.componentRef.setInput('name', 'Alice');
      fixture.detectChanges();

      const initials = fixture.nativeElement.querySelector('.coar-avatar__initials');
      expect(initials.textContent.trim()).toBe('ALI');
    });

    it('should display ? for empty name', () => {
      fixture.componentRef.setInput('name', '');
      fixture.detectChanges();

      const initials = fixture.nativeElement.querySelector('.coar-avatar__initials');
      expect(initials.textContent.trim()).toBe('?');
    });

    it('should show initials after image load error', () => {
      fixture.componentRef.setInput('src', 'https://example.com/broken.jpg');
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.detectChanges();

      // Simulate image error
      const img = fixture.nativeElement.querySelector('.coar-avatar__image');
      img.dispatchEvent(new Event('error'));
      fixture.detectChanges();

      const initials = fixture.nativeElement.querySelector('.coar-avatar__initials');
      expect(initials).toBeTruthy();
    });
  });

  describe('color generation', () => {
    it('should generate consistent color for the same name', () => {
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.detectChanges();

      const initials1 = fixture.nativeElement.querySelector('.coar-avatar__initials');
      const bgColor1 = initials1.style.backgroundColor;

      // Create a second component with the same name
      const fixture2 = TestBed.createComponent(CoarAvatarComponent);
      fixture2.componentRef.setInput('name', 'John Doe');
      fixture2.detectChanges();

      const initials2 = fixture2.nativeElement.querySelector('.coar-avatar__initials');
      const bgColor2 = initials2.style.backgroundColor;

      expect(bgColor1).toBe(bgColor2);
    });
  });

  describe('clickable mode', () => {
    it('should add clickable class when clickable is true', () => {
      fixture.componentRef.setInput('clickable', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-avatar--clickable');
    });

    it('should add role="button" when clickable', () => {
      fixture.componentRef.setInput('clickable', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('role')).toBe('button');
    });
  });
});
