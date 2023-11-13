import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, computed, signal } from '@angular/core';
import { keyEnter, keySpace } from '@microsoft/fast-web-utilities';
import { generateReplacements } from 'rename-replace/dist/replacements';
import { getTargetNames, parseTargetNames } from 'rename-replace/dist/targets';
import { Casing, Replacement, Target } from 'rename-replace/dist/types';
import { vscode } from '../utilities/vscode';

declare const currentPath: string;
declare const currentPathType: 'folder' | 'file';
declare const currentPathBaseName: string;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
      <div class="container space-y-4">
        <vscode-text-field class="w-full" readonly [value]="currentPath">
          <h3>Path</h3>
          <span *ngIf="currentPathType === 'folder'" slot="start" class="codicon codicon-folder"></span>
          <span *ngIf="currentPathType === 'file'" slot="start" class="codicon codicon-file"></span>
        </vscode-text-field>

        <div>
          <h3>Target</h3>
          <div class="flex flex-row space-x-2 items-center">
            <vscode-checkbox [indeterminate]="allTargetsIndeterminate()" [checked]="allTargetsChecked()" (click)="onAllTargetsChange($event)" (keypress)="onAllTargetsChange($event)">all</vscode-checkbox>
            @for (target of allTargets; track target) {
            <vscode-checkbox [checked]="targets()[target]" (change)="onTargetChange($event, target)">
              {{ target }}
            </vscode-checkbox>
            }
          </div>
        </div>

        <div class="flex flex-row space-x-4">
          <div class="basis-1/2">
            <vscode-text-field class="w-full" (keypress)="onReplaceTextKeyPress($event)" (input)="replaceFrom.set($any($event.target).value)" [value]="replaceFrom()"><h3>Replace from</h3></vscode-text-field>
          </div>
          <div class="basis-1/2">
            <vscode-text-field class="w-full" (keypress)="onReplaceTextKeyPress($event)" (input)="replaceTo.set($any($event.target).value)"><h3>Replace to</h3></vscode-text-field>
          </div>
        </div>
        
        <vscode-data-grid grid-template-columns="5rem 10rem 1fr 1fr" aria-label="Basic">
          <vscode-data-grid-row row-type="header">
            <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
              <vscode-checkbox [indeterminate]="allCasesIndeterminate()" [checked]="allCasesChecked()" (click)="onAllCasesChange($event)" (keypress)="onAllCasesChange($event)"></vscode-checkbox>
            </vscode-data-grid-cell>
            <vscode-data-grid-cell cell-type="columnheader" grid-column="2">Case</vscode-data-grid-cell>
            <vscode-data-grid-cell cell-type="columnheader" grid-column="3">From</vscode-data-grid-cell>
            <vscode-data-grid-cell cell-type="columnheader" grid-column="4">To</vscode-data-grid-cell>
          </vscode-data-grid-row>
          @for (replacement of replacements(); track replacement.casing) {
          <vscode-data-grid-row>
            <vscode-data-grid-cell grid-column="1">
              <vscode-checkbox [checked]="cases()[replacement.casing]" (change)="onCaseChange($event, replacement.casing)"></vscode-checkbox>
            </vscode-data-grid-cell>
            <vscode-data-grid-cell grid-column="2">{{ replacement.casing }}</vscode-data-grid-cell>
            <vscode-data-grid-cell grid-column="3">{{ replacement.from }}</vscode-data-grid-cell>
            <vscode-data-grid-cell grid-column="4">{{ replacement.to }}</vscode-data-grid-cell>
          </vscode-data-grid-row>
          }
        </vscode-data-grid>

        <div *ngIf="error() as error" class="error flex flex-row space-x-3 items-center">
          <i class="codicon codicon-error error-icon"></i>
          <div>{{ error }}</div>
        </div>
        
        <div class="flex flex-row items-center space-x-3">
          <div class="warning-simple flex flex-row space-x-3 items-center flex-1">
            <i class="codicon codicon-warning warning-icon"></i>
            <div>If the target of a renamed file already exists, then it will be overwritten. Please proceed with caution.</div>
          </div>
          <div class="flex flex-row space-x-3 items-center">
            <vscode-button appearance="secondary" class="rename-btn" [disabled]="!valid() || inProgress()" (click)="onRenameReplace(true)">
              <span *ngIf="inProgress() === 'duplicate'" slot="start" class="codicon codicon-loading codicon-modifier-spin"></span>
              Duplicate
            </vscode-button>
            <vscode-button class="rename-btn" [disabled]="!valid() || inProgress()" (click)="onRenameReplace(false)">
              <span *ngIf="inProgress() === 'rename'" slot="start" class="codicon codicon-loading codicon-modifier-spin"></span>
              Rename
            </vscode-button>
          </div>
        </div>
      </div>
  `,
  styles: [`
    h3 {
      margin: 0.5em 0;
    }

    .container {
      margin: 0 auto;
      padding: 0.5em;
      max-width: 1024px;
    }
  `],
})
export class AppComponent {
  public readonly currentPath = currentPath;
  public readonly currentPathType = currentPathType;
  public readonly currentPathBaseName = currentPathBaseName;
  public readonly error = signal<string | undefined>(undefined);
  public readonly inProgress = signal<'rename' | 'duplicate' | undefined>(undefined);
  public readonly replaceFrom = signal<string | undefined>(currentPathBaseName);
  public readonly replaceTo = signal<string | undefined>(undefined);
  public readonly valid = computed(() =>
    (this.replaceFrom()?.trim().length ?? 0) > 0 &&
    (this.replaceTo()?.trim().length ?? 0) > 0 &&
    Object.values(this.targets()).some(checked => checked)
  );

  public readonly cases = signal<Record<Casing, boolean>>({
    exact: true,
    camel: true,
    constant: true,
    header: true,
    kebab: true,
    pascal: true,
    sentence: true,
    snake: true,
    title: true,
    upper: true,
    lower: true
  });

  public readonly allCasesChecked = computed(() => Object.values(this.cases()).every(checked => checked));
  public readonly allCasesIndeterminate = computed(() => !this.allCasesChecked() && Object.values(this.cases()).some(checked => checked));

  public readonly allTargets = getTargetNames(Target.All);
  public readonly targets = signal(this.allTargets.reduce<{ [name: string]: boolean }>((acc, name) => ({ ...acc, [name]: true }), {}));
  public readonly allTargetsChecked = computed(() => Object.values(this.targets()).every(checked => checked));
  public readonly allTargetsIndeterminate = computed(() => !this.allTargetsChecked() && Object.values(this.targets()).some(checked => checked));

  public readonly replacements = computed<Array<Replacement & { casing: Casing }>>(() => generateReplacements(this.replaceFrom() ?? '', this.replaceTo() ?? ''));

  public onAllTargetsChange($event: Event | KeyboardEvent): void {
    if ('key' in $event && $event.key !== keySpace) return;
    const checked = ($event.target as HTMLInputElement).checked;
    this.targets.update(value => Object.keys(value).reduce((acc, name) => ({ ...acc, [name]: checked }), value));
  }

  public onTargetChange($event: Event, name: string): void {
    const checked = ($event.target as HTMLInputElement).checked;
    if (this.targets()[name] !== checked) {
      this.targets.update(value => ({ ...value, [name]: checked }));
    }
  }

  public onCaseChange($event: Event, casing: Casing): void {
    const checked = ($event.target as HTMLInputElement).checked;
    if (this.cases()[casing] !== checked) {
      this.cases.update(value => ({ ...value, [casing]: checked }));
    }
  }

  public onAllCasesChange($event: Event | KeyboardEvent): void {
    if ('key' in $event && $event.key !== keySpace) return;
    const checked = ($event.target as HTMLInputElement).checked;
    this.cases.update(value => (Object.keys(value) as Array<Casing>).reduce((acc, casing) => ({ ...acc, [casing]: checked }), value));
  }

  public onReplaceTextKeyPress($event: KeyboardEvent): void {
    if ($event.key !== keyEnter) return;
    this.onRenameReplace(false);
  }

  public onRenameReplace(duplicate: boolean) {
    if (!this.valid()) return;

    this.error.set(undefined);
    this.inProgress.set(undefined);
    const from = this.replaceFrom() as string;
    const to = this.replaceTo() as string;
    const casing = Object.entries(this.cases()).filter(([, checked]) => checked).map(([casing]) => casing) as Array<Casing>;
    const target = parseTargetNames(Object.entries(this.targets()).filter(([, checked]) => checked).map(([target]) => target));
    const options = { from, to, casing, target, duplicate };

    if (options.duplicate) {
      const replacements = generateReplacements(options.from, options.to, options.casing);
      if (replacements.every(({ from }) => !this.currentPathBaseName.includes(from))) {
        this.error.set(`Duplicate operation requires that the target ${this.currentPathType} name "${this.currentPathBaseName}" differs after renaming.`);
        return;
      }
    }

    this.inProgress.set(duplicate ? 'duplicate' : 'rename');
    vscode.postMessage({ command: 'renameReplace', options });
  }
}
