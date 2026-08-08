import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ComponentDefinitionTestComponent } from '../component-definition/presentation/component-definition-test/component-definition-test.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ComponentDefinitionTestComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
}
