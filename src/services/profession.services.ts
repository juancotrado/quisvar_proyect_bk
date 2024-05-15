import { Profession } from 'types/profession';
import { writeFileSync, readFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

class ProfessionService {
  get professions(): Profession[] {
    const json_profession = readFileSync('jsonData/professions.json', 'utf-8');
    const professions = JSON.parse(json_profession);
    return professions;
  }

  find(id: string) {
    const findProfession = this.professions.find(({ value }) => value === id);
    return findProfession || { label: 'unknow', value: 'unknow', amount: 0 };
  }

  userWithProfession(users: { [key: string]: any }[]) {
    const newUsers = users.map(user => {
      const findProfession = this.find(user.profile.job);
      const profile = {
        ...user.profile,
        job: findProfession,
      };
      return { ...user, profile };
    });
    return newUsers;
  }
  create({ abrv, label, amount }: Profession) {
    const newProfession = {
      value: uuidv4(),
      abrv,
      label,
      amount,
    };
    const professions = this.professions;
    professions.push(newProfession);
    const json_profession = JSON.stringify(professions, null, 3);
    writeFileSync('jsonData/professions.json', json_profession, 'utf-8');
    return newProfession;
  }

  delete(id: string) {
    const professions = this.professions;
    const filterProfession = professions.filter(({ value }) => value !== id);
    const json_profession = JSON.stringify(filterProfession);
    writeFileSync('jsonData/professions.json', json_profession, 'utf-8');
    return this.professions;
  }

  update({ abrv, label, value, amount }: Profession) {
    const professions = this.professions;
    const updateProfession = professions.map(profession =>
      profession.value === value
        ? { ...profession, abrv, label, amount }
        : profession
    );
    const json_profession = JSON.stringify(updateProfession, null, 3);
    writeFileSync('jsonData/professions.json', json_profession, 'utf-8');
    return updateProfession;
  }
}

export default new ProfessionService();
