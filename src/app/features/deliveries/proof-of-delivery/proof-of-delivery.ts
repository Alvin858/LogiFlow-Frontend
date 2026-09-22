import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {FormBuilder,FormGroup,ReactiveFormsModule,Validators} from '@angular/forms';
import {ActivatedRoute,Router,RouterModule} from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatSnackBar,MatSnackBarModule} from '@angular/material/snack-bar';

import {CreateProofOfDeliveryRequest,Delivery,ProofOfDelivery} from '../../../core/models/module3.models';

import { DeliveryService } from '../../../core/services/delivery.service';

@Component({
  selector: 'app-proof-of-delivery',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './proof-of-delivery.html',
  styleUrls: ['./proof-of-delivery.css']
})
export class ProofOfDeliveryComponent implements OnInit {

  podForm!: FormGroup;

  delivery: Delivery | null = null;
  proofOfDelivery: ProofOfDelivery | null = null;

  deliveryId = 0;

  loading = false;
  saving = false;

  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly deliveryService: DeliveryService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    const idParam =
      this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      this.errorMessage =
        'Delivery ID was not provided.';
      return;
    }

    this.deliveryId = Number(idParam);

    if (
      !Number.isInteger(this.deliveryId) ||
      this.deliveryId <= 0
    ) {
      this.errorMessage =
        'Invalid delivery ID.';
      return;
    }

    this.loadDelivery();
  }

  private initializeForm(): void {
    this.podForm = this.fb.group({
      receiverName: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      receiverContact: [
        '',
        Validators.maxLength(50)
      ],

      signaturePath: [
        '',
        Validators.maxLength(500)
      ],

      photoPath: [
        '',
        Validators.maxLength(500)
      ],

      remarks: [
        '',
        Validators.maxLength(1000)
      ]
    });
  }

  loadDelivery(): void {
    this.loading = true;
    this.errorMessage = '';

    this.deliveryService
      .getDeliveryById(this.deliveryId)
      .subscribe({
        next: (delivery) => {
          this.delivery = delivery;

          if (delivery.proofOfDelivery) {
            this.proofOfDelivery =
              delivery.proofOfDelivery;

            this.patchForm(
              delivery.proofOfDelivery
            );

            this.loading = false;
            return;
          }

          this.deliveryService
            .getProofOfDelivery(this.deliveryId)
            .subscribe({
              next: (pod) => {
                if (pod) {
                  this.proofOfDelivery = pod;
                  this.patchForm(pod);
                }

                this.loading = false;
              },

              error: () => {
                // No existing POD is acceptable.
                this.loading = false;
              }
            });
        },

        error: (error) => {
          this.loading = false;

          this.errorMessage =
            error?.message ||
            'Unable to load delivery.';
        }
      });
  }

  private patchForm(
    pod: ProofOfDelivery
  ): void {
    this.podForm.patchValue({
      receiverName:
        pod.receiverName,

      receiverContact:
        pod.receiverContact || '',

      signaturePath:
        pod.signaturePath || '',

      photoPath:
        pod.photoPath || '',

      remarks:
        pod.remarks || ''
    });
  }

  submit(): void {
    this.errorMessage = '';

    if (!this.delivery) {
      this.errorMessage =
        'Delivery information is unavailable.';
      return;
    }

    if (this.podForm.invalid) {
      this.podForm.markAllAsTouched();

      this.errorMessage =
        'Please enter the receiver name before saving.';

      return;
    }

    if (
      !this.deliveryService.canAddProofOfDelivery(
        this.delivery
      ) &&
      !this.proofOfDelivery
    ) {
      this.errorMessage =
        'Proof of delivery can only be added while the delivery is out for delivery.';

      return;
    }

    const request: CreateProofOfDeliveryRequest = {
      deliveryId: this.deliveryId,

      receiverName:
        String(
          this.podForm.value.receiverName
        ).trim(),

      receiverContact:
        this.emptyToNull(
          this.podForm.value.receiverContact
        ),

      signaturePath:
        this.emptyToNull(
          this.podForm.value.signaturePath
        ),

      photoPath:
        this.emptyToNull(
          this.podForm.value.photoPath
        ),

      remarks:
        this.emptyToNull(
          this.podForm.value.remarks
        )
    };

    this.saving = true;

    this.deliveryService
      .createProofOfDelivery(request)
      .subscribe({
        next: (updatedDelivery) => {
          this.saving = false;

          /*
           * DeliveryService currently returns Delivery
           * from createProofOfDelivery().
           */
          this.delivery = updatedDelivery;

          this.proofOfDelivery =
            updatedDelivery.proofOfDelivery ?? null;

          this.snackBar.open(
            'Proof of delivery saved successfully.',
            'Close',
            {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            }
          );

          this.router.navigate([
            '/deliveries',
            this.deliveryId
          ]);
        },

        error: (error) => {
          this.saving = false;

          this.errorMessage =
            error?.message ||
            'Failed to save proof of delivery.';
        }
      });
  }

  cancel(): void {
    this.router.navigate([
      '/deliveries',
      this.deliveryId
    ]);
  }

  clearForm(): void {
    this.podForm.reset({
      receiverName: '',
      receiverContact: '',
      signaturePath: '',
      photoPath: '',
      remarks: ''
    });

    this.errorMessage = '';
  }

  getControlError(
    controlName: string
  ): string {
    const control =
      this.podForm.get(controlName);

    if (!control || !control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Receiver name is required.';
    }

    if (control.hasError('maxlength')) {
      return 'Maximum length exceeded.';
    }

    return '';
  }

  formatDate(
    value: string | null | undefined
  ): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  private emptyToNull(
    value: string | null | undefined
  ): string | null {
    const trimmed =
      String(value || '').trim();

    return trimmed ? trimmed : null;
  }
}