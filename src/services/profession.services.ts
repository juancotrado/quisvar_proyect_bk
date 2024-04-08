import { Profession } from 'types/profession';
const fs = require('fs');

class ProfessionService {
  private _profession: Profession;

  constructor() {
    const json_profession = fs.readFileSync(
      'public/json/professions.json',
      'utf-8'
    );
    this._profession = JSON.parse(json_profession);
  }

  showProfessions() {
    return this._profession;
  }
}

export default new ProfessionService();
