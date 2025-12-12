import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import type { MarkdownDocument } from '@cocoar/markdown-core';
import { CoarMarkdownComponent } from './coar-markdown.component';

@Component({
  standalone: true,
  imports: [CoarMarkdownComponent],
  template: `<coar-markdown [doc]="doc" />`,
})
class HostComponent {
  doc: MarkdownDocument = {
    nodes: [
      {
        id: 'h1',
        type: 'heading',
        attrs: { depth: 1, anchor: 'title' },
        children: [{ id: 't1', type: 'text', text: 'Title' }],
      },
      {
        id: 'p1',
        type: 'paragraph',
        children: [
          { id: 't2', type: 'text', text: 'See ' },
          {
            id: 'l1',
            type: 'link',
            attrs: { url: 'https://example.com' },
            children: [{ id: 't3', type: 'text', text: 'example' }],
          },
          { id: 'tImg1', type: 'text', text: ' ' },
          {
            id: 'img1',
            type: 'image',
            attrs: { url: 'https://example.com/image.png', alt: 'Alt' },
          },
          { id: 'tHash1', type: 'text', text: ' and ' },
          {
            id: 'l2',
            type: 'link',
            attrs: { url: '#title' },
            children: [{ id: 'tHash2', type: 'text', text: 'jump' }],
          },
          { id: 't4', type: 'text', text: '.' },
          { id: 'br1', type: 'lineBreak' },
          { id: 't5', type: 'text', text: 'Next line' },
        ],
      },
      {
        id: 'cb1',
        type: 'codeBlock',
        attrs: { language: 'ts' },
        text: 'const x: number = 1;\n',
      },
      {
        id: 'tbl1',
        type: 'table',
        attrs: { align: ['left', 'right'] },
        children: [
          {
            id: 'tbl1-r0',
            type: 'tableRow',
            children: [
              {
                id: 'tbl1-r0-c0',
                type: 'tableCell',
                children: [{ id: 'tbl1-r0-c0-t', type: 'text', text: 'Option' }],
              },
              {
                id: 'tbl1-r0-c1',
                type: 'tableCell',
                children: [{ id: 'tbl1-r0-c1-t', type: 'text', text: 'Value' }],
              },
            ],
          },
          {
            id: 'tbl1-r1',
            type: 'tableRow',
            children: [
              {
                id: 'tbl1-r1-c0',
                type: 'tableCell',
                children: [{ id: 'tbl1-r1-c0-t', type: 'text', text: 'foo' }],
              },
              {
                id: 'tbl1-r1-c1',
                type: 'tableCell',
                children: [{ id: 'tbl1-r1-c1-t', type: 'text', text: '123' }],
              },
            ],
          },
        ],
      },
      {
        id: 'u1',
        type: 'unsupported',
        attrs: { originalType: 'html' },
      },
    ],
  };
}

describe('CoarMarkdownComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('renders external links with target=_blank and rel=noopener noreferrer', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const anchors = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    expect(anchors.length).toBeGreaterThanOrEqual(2);

    const external = anchors.find((a) => a.getAttribute('href') === 'https://example.com');
    expect(external).toBeTruthy();
    expect(external?.getAttribute('target')).toBe('_blank');
    expect(external?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('does not force hash anchors to open in a new tab', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const anchors = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    const hash = anchors.find((a) => (a.getAttribute('href') ?? '').includes('#title'));
    expect(hash).toBeTruthy();
    expect(hash?.getAttribute('target')).toBeNull();
    expect(hash?.getAttribute('rel')).toBeNull();
  });

  it('renders unsupported nodes as a placeholder', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const unsupported = fixture.nativeElement.querySelector('.coar-markdown-unsupported');
    expect(unsupported?.textContent).toContain('Unsupported markdown node');
  });

  it('renders line breaks as <br>', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const br = fixture.nativeElement.querySelector('br');
    expect(br).toBeTruthy();
  });

  it('renders code blocks via <coar-code-block>', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const codeBlock = fixture.nativeElement.querySelector('coar-code-block');
    expect(codeBlock).toBeTruthy();
  });

  it('renders images as <img>', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement | null;
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('https://example.com/image.png');
    expect(img?.getAttribute('alt')).toBe('Alt');
  });

  it('renders tables via <coar-table> with header cells and alignment classes', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const coarTable = fixture.nativeElement.querySelector('coar-table');
    expect(coarTable).toBeTruthy();

    const ths = Array.from(fixture.nativeElement.querySelectorAll('coar-table th')) as HTMLElement[];
    expect(ths.length).toBe(2);
    expect(ths[0]?.textContent?.trim()).toBe('Option');
    expect(ths[1]?.textContent?.trim()).toBe('Value');
    expect(ths[1].classList.contains('text-right')).toBe(true);

    const tds = Array.from(fixture.nativeElement.querySelectorAll('coar-table td')) as HTMLElement[];
    expect(tds.length).toBe(2);
    expect(tds[0]?.textContent?.trim()).toBe('foo');
    expect(tds[1]?.textContent?.trim()).toBe('123');
    expect(tds[1].classList.contains('text-right')).toBe(true);
  });
});
