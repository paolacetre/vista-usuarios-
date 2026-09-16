import { Component } from '@angular/core';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-about-tab',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './about-tab.component.html',
  styleUrl: './about-tab.component.scss'
})
export class AboutTabComponent {
  readonly version = 'v1.0.0';
}
