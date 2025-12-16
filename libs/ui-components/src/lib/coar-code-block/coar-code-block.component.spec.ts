import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { CoarCodeBlockComponent } from './coar-code-block.component';

// Test host component
@Component({
  standalone: true,
  imports: [CoarCodeBlockComponent],
  template: `
    <coar-code-block
      [code]="code"
      [language]="language"
      [title]="title"
      [collapsible]="collapsible"
      [collapsed]="collapsed"
      [showCopy]="showCopy"
      [showLineNumbers]="showLineNumbers"
      [maxHeight]="maxHeight"
    />
  `,
})
class TestHostComponent {
  code = 'const x = 1;';
  language = 'typescript';
  title = '';
  collapsible = true;
  collapsed = false;
  showCopy = true;
  showLineNumbers = false;
  maxHeight = 0;
}

describe('CoarCodeBlockComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let hostElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    hostElement = fixture.nativeElement;
  });

  function getBlockElement(): HTMLElement | null {
    return hostElement.querySelector('.coar-code-block');
  }

  function getHeaderElement(): HTMLElement | null {
    return hostElement.querySelector('.coar-code-header');
  }

  function getToggleButton(): HTMLButtonElement | null {
    return hostElement.querySelector('.coar-code-toggle');
  }

  function getCopyButton(): HTMLElement | null {
    return hostElement.querySelector('coar-button');
  }

  function getCodeContent(): HTMLElement | null {
    return hostElement.querySelector('.coar-code-content');
  }

  function getCodeElement(): HTMLElement | null {
    return hostElement.querySelector('.coar-code');
  }

  function getTitleElement(): HTMLElement | null {
    return hostElement.querySelector('.coar-code-title');
  }

  function getLanguageElement(): HTMLElement | null {
    return hostElement.querySelector('.coar-code-language');
  }

  describe('rendering', () => {
    it('should create', () => {
      expect(getBlockElement()).toBeTruthy();
    });

    it('should render code block', () => {
      expect(getCodeContent()).toBeTruthy();
    });

    it('should render header', () => {
      expect(getHeaderElement()).toBeTruthy();
    });

    it('should display code', () => {
      expect(getCodeElement()?.innerHTML).toBeTruthy();
    });
  });

  describe('title and language', () => {
    it('should show language when no title provided', () => {
      expect(getLanguageElement()?.textContent).toContain('typescript');
      expect(getTitleElement()).toBeNull();
    });

    it('should show title when provided', () => {
      hostComponent.title = 'Example Code';
      fixture.detectChanges();
      expect(getTitleElement()?.textContent).toContain('Example Code');
    });
  });

  describe('syntax highlighting', () => {
    it('should highlight TypeScript code', () => {
      hostComponent.code = 'const message: string = "hello";';
      hostComponent.language = 'typescript';
      fixture.detectChanges();
      const code = getCodeElement();
      // Prism adds token classes for highlighting
      expect(code?.innerHTML).toContain('class=');
    });

    it('should handle JavaScript', () => {
      hostComponent.code = 'function test() { return true; }';
      hostComponent.language = 'javascript';
      fixture.detectChanges();
      expect(getCodeElement()?.innerHTML).toBeTruthy();
    });

    it('should handle HTML/markup', () => {
      hostComponent.code = '<div class="test">Hello</div>';
      hostComponent.language = 'html';
      fixture.detectChanges();
      expect(getCodeElement()?.innerHTML).toBeTruthy();
    });

    it('should handle CSS', () => {
      hostComponent.code = '.test { color: red; }';
      hostComponent.language = 'css';
      fixture.detectChanges();
      expect(getCodeElement()?.innerHTML).toBeTruthy();
    });

    it('should handle JSON', () => {
      hostComponent.code = '{"key": "value"}';
      hostComponent.language = 'json';
      fixture.detectChanges();
      expect(getCodeElement()?.innerHTML).toBeTruthy();
    });

    it('should handle unknown language gracefully', () => {
      hostComponent.code = 'some unknown code';
      hostComponent.language = 'unknownlang';
      fixture.detectChanges();
      // Should still render, just without highlighting
      expect(getCodeElement()?.textContent).toContain('some unknown code');
    });
  });

  describe('collapsible behavior', () => {
    it('should show toggle button when collapsible', () => {
      expect(getToggleButton()).toBeTruthy();
    });

    it('should hide toggle button when not collapsible', () => {
      hostComponent.collapsible = false;
      fixture.detectChanges();
      expect(getToggleButton()).toBeNull();
    });

    it('should show code content when not collapsed', () => {
      expect(getCodeContent()).toBeTruthy();
    });

    it('should toggle collapsed state on button click', fakeAsync(() => {
      // Wait for initial collapsed state to be set
      tick(0);
      fixture.detectChanges();

      // Initially not collapsed
      expect(getCodeContent()).toBeTruthy();

      // Click to collapse
      getToggleButton()?.click();
      fixture.detectChanges();

      expect(getCodeContent()).toBeNull();

      // Click to expand
      getToggleButton()?.click();
      fixture.detectChanges();

      expect(getCodeContent()).toBeTruthy();
    }));

    it('should set aria-expanded attribute correctly', fakeAsync(() => {
      tick(0);
      fixture.detectChanges();

      const toggle = getToggleButton();
      expect(toggle?.getAttribute('aria-expanded')).toBe('true');

      toggle?.click();
      fixture.detectChanges();

      expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    }));
  });

  describe('copy button', () => {
    it('should show copy button when showCopy is true', () => {
      expect(getCopyButton()).toBeTruthy();
    });

    it('should hide copy button when showCopy is false', () => {
      hostComponent.showCopy = false;
      fixture.detectChanges();
      expect(getCopyButton()).toBeNull();
    });

    it('should have accessible label', () => {
      expect(getCopyButton()?.getAttribute('aria-label')).toBe('Copy code');
    });
  });

  describe('line numbers', () => {
    it('should render line numbers when enabled', () => {
      hostComponent.code = 'line 1\nline 2\nline 3';
      hostComponent.showLineNumbers = true;
      fixture.detectChanges();

      const lineNumbers = hostElement.querySelectorAll('.coar-code-line-number');
      expect(lineNumbers.length).toBe(3);
      expect(lineNumbers[0]?.textContent).toContain('1');
      expect(lineNumbers[2]?.textContent).toContain('3');
    });
  });

  describe('max height', () => {
    it('should not set max-height when maxHeight is 0', () => {
      const content = getCodeContent();
      expect(content?.style.maxHeight).toBeFalsy();
    });

    it('should set max-height when maxHeight is provided', () => {
      hostComponent.maxHeight = 200;
      fixture.detectChanges();
      const content = getCodeContent();
      expect(content?.style.maxHeight).toBe('200px');
    });
  });

  describe('language aliases', () => {
    it('should map ts to typescript', () => {
      hostComponent.language = 'ts';
      hostComponent.code = 'const x: number = 1;';
      fixture.detectChanges();
      // Should still highlight properly
      expect(getCodeElement()?.innerHTML).toContain('class=');
    });

    it('should map js to javascript', () => {
      hostComponent.language = 'js';
      hostComponent.code = 'const x = 1;';
      fixture.detectChanges();
      expect(getCodeElement()?.innerHTML).toBeTruthy();
    });

    it('should map xml to markup', () => {
      hostComponent.language = 'xml';
      hostComponent.code = '<root><child/></root>';
      fixture.detectChanges();
      expect(getCodeElement()?.innerHTML).toBeTruthy();
    });

    it('should map sh to bash', () => {
      hostComponent.language = 'sh';
      hostComponent.code = 'echo "hello"';
      fixture.detectChanges();
      expect(getCodeElement()?.innerHTML).toBeTruthy();
    });
  });

  describe('copy functionality', () => {
    let originalClipboard: Clipboard;
    let writeTextMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      originalClipboard = navigator.clipboard;
      writeTextMock = vi.fn();
    });

    afterEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      });
    });

    it('should copy code to clipboard successfully', async () => {
      writeTextMock.mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });

      hostComponent.code = 'console.log("test");';
      fixture.detectChanges();

      // Directly call copyCode on the component
      const codeBlockComponent = fixture.debugElement.query(
        (el) => el.componentInstance?.copyCode
      )?.componentInstance;

      await codeBlockComponent.copyCode();
      fixture.detectChanges();

      expect(writeTextMock).toHaveBeenCalledWith('console.log("test");');
    });

    it('should show copied feedback after successful copy', async () => {
      writeTextMock.mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });

      hostComponent.code = 'test code';
      fixture.detectChanges();

      const codeBlockComponent = fixture.debugElement.query(
        (el) => el.componentInstance?.copyCode
      )?.componentInstance;

      await codeBlockComponent.copyCode();
      fixture.detectChanges();

      // copyFeedback should be 'copied'
      expect(codeBlockComponent.copyFeedback()).toBe('copied');
    });

    it('should show error feedback when copy fails', async () => {
      writeTextMock.mockRejectedValue(new Error('Copy failed'));
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });

      hostComponent.code = 'test code';
      fixture.detectChanges();

      const codeBlockComponent = fixture.debugElement.query(
        (el) => el.componentInstance?.copyCode
      )?.componentInstance;

      await codeBlockComponent.copyCode();
      fixture.detectChanges();

      // copyFeedback should be 'error'
      expect(codeBlockComponent.copyFeedback()).toBe('error');
    });

    it('should reset feedback after timeout', async () => {
      vi.useFakeTimers();
      writeTextMock.mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });

      hostComponent.code = 'test code';
      fixture.detectChanges();

      const codeBlockComponent = fixture.debugElement.query(
        (el) => el.componentInstance?.copyCode
      )?.componentInstance;

      await codeBlockComponent.copyCode();
      fixture.detectChanges();

      expect(codeBlockComponent.copyFeedback()).toBe('copied');

      // Advance past the 2000ms feedback timeout
      vi.advanceTimersByTime(2100);
      fixture.detectChanges();

      expect(codeBlockComponent.copyFeedback()).toBe('idle');

      vi.useRealTimers();
    });
  });
});

// Standalone component tests
describe('CoarCodeBlockComponent standalone', () => {
  let fixture: ComponentFixture<CoarCodeBlockComponent>;
  let component: CoarCodeBlockComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarCodeBlockComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarCodeBlockComponent);
    component = fixture.componentInstance;
    // Set required input
    fixture.componentRef.setInput('code', 'test');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default language of html', () => {
    expect(component.language()).toBe('html');
  });

  it('should have default collapsible of true', () => {
    expect(component.collapsible()).toBe(true);
  });

  it('should have default collapsed of false', () => {
    expect(component.collapsed()).toBe(false);
  });

  it('should have default showCopy of true', () => {
    expect(component.showCopy()).toBe(true);
  });

  it('should have default showLineNumbers of false', () => {
    expect(component.showLineNumbers()).toBe(false);
  });

  it('should have default maxHeight of 0', () => {
    expect(component.maxHeight()).toBe(0);
  });

  it('should calculate lines correctly', () => {
    fixture.componentRef.setInput('code', 'line1\nline2\nline3');
    fixture.detectChanges();
    expect(component.lines).toEqual([1, 2, 3]);
  });
});
