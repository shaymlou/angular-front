import { Component, OnInit, Input } from '@angular/core';
import { AssignmentsService } from '../shared/assignments.service';
import { Assignment } from './assignment.model';
import {MatDialog} from '@angular/material/dialog';
import {DialogDeleteComponent} from "../dialog-delete/dialog-delete.component";
import {Router} from "@angular/router";
import {AuthService} from "../shared/auth.service";

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.css'],
})
export class AssignmentsComponent implements OnInit {
  titre = '';
  couleur = 'violet';
  // Pour la pagination
  page: number = 1;
  limit: number = 5;
  totalDocs: number = 0;
  totalPages: number = 0;
  hasPrevPage: boolean = false;
  prevPage: number = 0;
  hasNextPage: boolean = false;
  nextPage: number = 0;

  // pour l'affichage en table
  displayedColumns: string[] = ['demo-id', 'demo-nom', 'demo-dateDeRendu', 'demo-rendu',
    "detail","edit","delete"];

  assignments: Assignment[] = [];

  constructor(private assignmentService: AssignmentsService, public dialog: MatDialog,
              private router: Router,private authService: AuthService) {}

  ngOnInit(): void {
    // appelé AVANT l'affichage (juste après le constructeur)
    console.log('AVANT AFFICHAGE');
    // on va demander au service de nous renvoyer les données (les assignments)
    // typiquement : le service envoie une requête AJAX sur un web service
    // du cloud...

    this.getAssignments();
  }

  getAssignments() {
    console.log('On demande les assignments au service');
    this.assignmentService
      .getAssignmentsPagine(this.page, this.limit)
      .subscribe((data) => {
        // quand on rentre ici on sait que les données sont prêtes
        console.log('données reçues');
        this.assignments = data.docs;
        this.page = data.page;

        this.limit = data.limit;
        this.totalDocs = data.totalDocs;
        this.totalPages = data.totalPages;
        this.hasPrevPage = data.hasPrevPage;
        this.prevPage = data.prevPage;
        this.hasNextPage = data.hasNextPage;
        this.nextPage = data.nextPage;
        console.log('données reçues');
      });

    console.log('demande envoyée au service');
  }
  pageSuivante() {
    if (this.hasNextPage) {
      this.page = this.nextPage;
      this.getAssignments();
    }
  }

  pagePrecedente() {
    if (this.hasPrevPage) {
      this.page = this.prevPage;
      this.getAssignments();
    }
  }

  dernierePage() {
    this.page = this.totalPages;
    this.getAssignments();
  }

  premierePage() {
    this.page = 1;
    this.getAssignments();
  }
  assignmentTransmis?: Assignment;
  @Input() idAssi:any;

  openDelteDialog(id: number){
    let dialogDeleteRef = this.dialog.open(DialogDeleteComponent);

    dialogDeleteRef.afterClosed().subscribe(result => {
      if (result==="true"){
        this.assignmentService.getAssignment(id).subscribe((assignment) => {
          this.assignmentTransmis = assignment;
        });
        if(this.assignmentTransmis){
          this.assignmentService.deleteAssignment(this.assignmentTransmis)
            .subscribe((reponse) => {
              console.log('Réponse du serveur : ' + reponse.message);
              // on navigue vers la page d'accueil pour afficher la liste à jour
              this.router.navigate(['/home']);
            });
          this.assignmentTransmis = undefined;
        }
      }
    });
  }

  onClickEdit() {
    this.router.navigate(['/assignment', this.assignmentTransmis?.id, 'edit']);
  }
  isAdmin() {
    return this.authService.loggedIn;
  }
}
