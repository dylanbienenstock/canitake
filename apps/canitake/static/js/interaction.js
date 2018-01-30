/* 

   Status levels, least to most severe 
   -----------------------------------
   Low Risk & Synergy
   Low Risk & No Synergy
   Low Risk & Decrease
   Caution
   Unsafe
   Dangerous


   Sources
   -------
   Tripsit
   RxNorm

*/

class Interaction {
	constructor(data) {
		this.drugA = data.drugA;
		this.drubB = data.drubB;
		this.status = data.status; 	 // Severity of the interaction
		this.comment = data.comment; // A note about the interaction
		this.source = data.source;   // Which API it came from

		if (this.source == "RxNorm") {
			switch (this.status) {
				case "high":
					this.status = "Dangerous";
					break;
				default:
					this.status = "Caution";
					break;
			}
		}
	}
}