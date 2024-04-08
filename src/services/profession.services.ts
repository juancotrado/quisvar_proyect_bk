import { Profession } from 'types/profession';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

class ProfessionService {
  private professions: Profession[];

  constructor() {
    const json_profession = fs.readFileSync('json/professions.json', 'utf-8');
    this.professions = JSON.parse(json_profession);
  }

  getAll() {
    return this.professions;
  }

  create({ abrv, label }: Profession) {
    const newProfession = {
      value: uuidv4(),
      abrv,
      label,
    };
    this.professions.push(newProfession);
    const json_profession = JSON.stringify(this.professions);
    fs.writeFileSync('json/professions.json', json_profession, 'utf-8');
    return newProfession;
  }

  delete(id: string) {
    const filterProfession = this.professions.filter(
      ({ value }) => value !== id
    );
    const json_profession = JSON.stringify(filterProfession);
    fs.writeFileSync('json/professions.json', json_profession, 'utf-8');
    return this.professions;
  }

  update({ abrv, label, value }: Profession) {
    const updateProfession = this.professions.map(profession =>
      profession.value === value ? { ...profession, abrv, label } : profession
    );
    const json_profession = JSON.stringify(updateProfession);
    fs.writeFileSync('json/professions.json', json_profession, 'utf-8');
    return updateProfession;
  }
}

export default new ProfessionService();
