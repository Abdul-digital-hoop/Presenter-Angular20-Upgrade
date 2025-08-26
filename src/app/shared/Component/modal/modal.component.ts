import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
declare var $: any;
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  @Input()isShowModal : boolean ;
  @Input() modalType: 'publish' | 'edit' |'preview' = 'preview' ;
  @Output() closePreviewModal = new EventEmitter <any>();
  @Output() closePublishModal = new EventEmitter <any>();
  @Output() closeEditModal = new EventEmitter <any>();

  constructor() { }

  ngOnInit(): void {
  }

  onDismissClick(){
    this.isShowModal = false;
    this.closePreviewModal.emit(this.isShowModal);
    this.closePublishModal.emit(this.isShowModal);
    this.closeEditModal.emit(this.isShowModal);
    this.clearModal();
  }
  ngOnDestroy(): void {
    this.clearModal();
  }
  clearModal() {
    $('.modal').modal('hide');
    $('.modal-backdrop').remove();
    $('body').removeClass('modal-open').css('padding-right', '');
  }
}
